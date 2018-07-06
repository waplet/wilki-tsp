const express = require('express');
const googleMaps = require('@google/maps');
const app = express();
const port = process.env.PORT || 5000;
const MAPS_API_KEY = process.env.MAPS_API_KEY;
const bodyParser = require('body-parser');
// const CHUNK_SIZE = 25;
const CHUNK_SIZE = 3;

if (!MAPS_API_KEY) {
    throw new Error('No api key set');
}

let googleMapsClient = googleMaps.createClient({key: MAPS_API_KEY});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/api/hello', (req, res) => {
    res.send({express: 'Hello from Express'});
});

app.use('/', express.static(__dirname + '/../build'));

/**
 * Example
 * [
 {"lat":56.5408573, "lng":20.9090444},
 {"lat":56.9714549, "lng":24.0591238},
 {"lat":56.6441733, "lng":23.6417331},
 {"lat":56.3311733, "lng":23.7517331}
 ]
 */
app.post('/api/distances', (req, res) => {
    let points = req.body.points;

    apiDistancesChunked(points)
        .then(distances => {
            res.send(distances);
        })
        .catch(err => {
            res.status(500);
            res.send(err);
        });
});

app.post('/api/path', (req, res) => {
    let pointDistances = req.body.pointDistances;

    apiPath(pointDistances)
        .then(path => {
            res.send(path);
        })
        .catch(err => {
            res.status(500);
            res.send(err);
        })
});

app.post('/api/route', (req, res) => {

    let points = req.body.points;

    apiDistancesChunked(points)
        .then(distances => {
            return apiPath(distances);
        })
        .then(path => {
            return path.map(index => {
                return points[index];
            });
        })
        .then(route => {
            res.send(route);
        })
        .catch(err => {
            res.status(500);
            res.send(err);
        });
});


let points = [
    {"lat":56.5408573, "lng":20.9090444},
    {"lat":56.9714549, "lng":24.0591238},
    {"lat":56.6441733, "lng":23.6417331},
    {"lat":56.3311733, "lng":23.7517331}
];

apiDistancesChunked(points)
    .then(pointDistances => console.log(pointDistances))
    .catch(err => console.log(err));

// app.listen(port, () => console.log(`Listening on port ${port}`));

/**
 * @param {{}|GoogleMapsClient} googleMapsClient
 * @param {{lat: Number, lng: Number}} pointFrom
 * @param {{lat: Number, lng: Number}} pointTo
 * @return Promise
 */
function getPointDistance(googleMapsClient, pointFrom, pointTo) {
    return new Promise((resolve, reject) => {
        googleMapsClient.distanceMatrix({
            origins: [pointFrom],
            destinations: [pointTo]
        }, (err, response) => {
            if (!err) {
                let distance = response.json.rows.slice().pop().elements.slice().pop().distance.value;

                resolve({
                    pointFrom: pointFrom,
                    pointTo: pointTo,
                    distance: distance,
                });
                return;
            }

            reject(err);
        })
    })
}

/**
 *
 * @param {{}|GoogleMapsClient} googleMapsClient
 * @param {Array<{lat: Number, lng: Number}>} pointsFrom
 * @param {Array<{lat: Number, lng: Number}>} pointsTo
 */
function getPointsDistanceBulk(googleMapsClient, pointsFrom, pointsTo) {
    return new Promise((resolve, reject) => {
        googleMapsClient.distanceMatrix({
            origins: [pointsFrom],
            destinations: [pointsTo]
        }, (err, response) => {
            if (!err) {
                let result = [];
                let rows = response.json.rows;

                rows.forEach((row, pointFromIndex) => {
                   row.elements.forEach((element, pointToIndex) => {
                       if (!result[pointFromIndex]) {
                           result[pointFromIndex] = [];
                       }

                       result[pointFromIndex][pointToIndex] = element.distance.value;
                   })
                });

                resolve(result);
                return;
            }

            reject(err);
        })
    })
}

/**
 * @param {Array} array
 * @param {Number} chunkSize
 * @return {Array}
 */
function chunkArray(array, chunkSize = CHUNK_SIZE) {
    let i, j, result = [];

    for (i = 0, j = array.length; i < j; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));

    }

    return result;
}

/**
 *[
 {
   "pointFrom": {
     "lat": 56.5408573,
     "lng": 20.9090444,
     "id": 0
   },
   "pointTo": {
     "lat": 56.9714549,
     "lng": 24.0591238,
     "id": 1
   },
   "distance": 218134
 },
 {
   "pointFrom": {
     "lat": 56.5408573,
     "lng": 20.9090444,
     "id": 0
   },
   "pointTo": {
     "lat": 56.6441733,
     "lng": 23.6417331,
     "id": 2
   },
   "distance": 181829
 },
 {
   "pointFrom": {
     "lat": 56.9714549,
     "lng": 24.0591238,
     "id": 1
   },
   "pointTo": {
     "lat": 56.6441733,
     "lng": 23.6417331,
     "id": 2
   },
   "distance": 62665
 }
 ]
 * @param {Array} pointsDistances
 * @return {Array}
 */
function getMatrixFromDistances(pointsDistances) {
    let distanceMatrix = [];

    for (let key in pointsDistances) {
        let distanceObject = pointsDistances[key];

        let pointFrom = distanceObject.pointFrom;
        let pointTo = distanceObject.pointTo;
        let distance = distanceObject.distance;

        if (!distanceMatrix[pointFrom.id]) {
            distanceMatrix[pointFrom.id] = [];
            distanceMatrix[pointFrom.id][pointFrom.id] = 0;
        }
        if (!distanceMatrix[pointTo.id]) {
            distanceMatrix[pointTo.id] = [];
            distanceMatrix[pointTo.id][pointTo.id] = 0;
        }

        distanceMatrix[pointFrom.id][pointTo.id] = distance || 0;
        distanceMatrix[pointTo.id][pointFrom.id] = distance || 0;
    }

    return distanceMatrix;
}

/**
 * @param {string} jsonString
 * @return {Promise<any>}
 */
function runPy(jsonString) {
    return new Promise((resolve, reject) => {
        const {spawn} = require('child_process');
        const pyApp = spawn('python3', [__dirname + '/test.py', jsonString])

        pyApp.stdout.on('data', data => {
            resolve(data);
        });

        pyApp.stderr.on('data', data => {
            reject(data);
        });
    });
}

/**
 * @param {Array} points
 * @return {Promise<any>}
 */
function apiDistances(points) {
    return new Promise((resolve, reject) => {
        if (!points || !Array.isArray(points)) {
            reject('Points not found');
            return;
        }

        let pointMapping = [];
        for (let i = 0; i < points.length - 1; i++) {
            if (!points[i].hasOwnProperty('lng') || !points[i].hasOwnProperty('lat')) {
                continue;
            }

            for (let j = i + 1; j < points.length; j++) {
                pointMapping.push({
                    pointFrom: Object.assign({}, points[i], {id: i}),
                    pointTo: Object.assign({}, points[j], {id: j}),
                });
            }
        }

        return Promise.all(pointMapping.map(pointMap => {
            return getPointDistance(googleMapsClient, pointMap.pointFrom, pointMap.pointTo);
        })).then(distances => {
            resolve(distances);
        });
    });
}

/**
 * @param {Array} points
 */
function apiDistancesChunked(points) {
    return new Promise((resolve, reject) => {
        if (!points || !Array.isArray(points)) {
            reject('Points not found');
            return;
        }

        /**
         * @type {Array} [[], [], []]
         */
        let chunkedPoints = chunkArray(points.map((val, i) => {
            return {...val, pointId: i};
        }));
        let result = [];

        for (let i = 0; i < chunkedPoints.length; i++) {
            for (let j = i; j < chunkedPoints.length; j++) {
                result.push({
                    pointsFrom: chunkedPoints[i],
                    pointsTo: chunkedPoints[j],
                    fromIndex: i,
                    toIndex: j
                });
            }
        }

        resolve(result);
    })
        .then(chunkedPoints => {
            return Promise.all(chunkedPoints.map(pointsObject => {
                return new Promise((resolve, reject) => {
                    getPointsDistanceBulk(googleMapsClient, pointsObject.pointsFrom, pointsObject.pointsTo)
                        .then(distances => {
                            resolve({
                                ...pointsObject,
                                distances: distances,
                            })
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
            }))
        })
        .then(chunkedPointsWithDistances => {
            let pointDistances = [];

            chunkedPointsWithDistances.forEach(chunkWithDistance => {
                chunkWithDistance.distances.forEach((distancesI, fromIndex) => {
                    distancesI.forEach((distance, toIndex) => {
                        pointDistances.push({
                            pointFrom: chunkWithDistance.pointsFrom[fromIndex],
                            pointTo: chunkWithDistance.pointsTo[toIndex],
                            distance: distance,
                        });
                    });
                });
            });

            return pointDistances;
        });
}

let D = 1;
function getPointDistancesBulkFake(pointsFrom, pointsTo) {
    return new Promise((resolve, reject) => {
        let result = [];
        pointsFrom.forEach((val, i) => {
            pointsTo.forEach((val, j) => {
                if (!result[i]) {
                    result[i] = [];
                }

                result[i][j] = D++;
            });
        });

        resolve(result);
    });
}


/**
 * @param {Array} pointDistances
 * @return {Promise<any>}
 */
function apiPath(pointDistances) {
    return new Promise((resolve, reject) => {
        if (!pointDistances || !Array.isArray(pointDistances)) {
            reject('Distance matrix not found');
            return;
        }

        let matrix = getMatrixFromDistances(pointDistances);

        runPy(JSON.stringify(matrix)).then(stdout => {
            resolve(JSON.parse(stdout.toString()));
        }).catch(err => {
            reject(err)
        });
    });
}
