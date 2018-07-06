#!/usr/local/bin/python3
import sys
import json
from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2


def main():
    if len(sys.argv) < 2:
        # print("No arguments passed")
        print("[]")
        return

    distance_matrix = json.loads(sys.argv[1])

    if type(distance_matrix) is not list:
        # print("Incorrect input data")
        print("[]")
        return

    tsp_size = len(distance_matrix)
    num_routes = 1
    depot = 0

    if tsp_size > 0:
        routing = pywrapcp.RoutingModel(tsp_size, num_routes, depot)
        search_parameters = pywrapcp.RoutingModel.DefaultSearchParameters()

        dist_between_nodes = CreateDistanceCallback(distance_matrix)
        dist_callback = dist_between_nodes.distance
        routing.SetArcCostEvaluatorOfAllVehicles(dist_callback)

        assignment = routing.SolveWithParameters(search_parameters)

        if assignment:
            # print("Total distance: %s meters\n" % str(assignment.ObjectiveValue()))
            route_number = 0
            index = routing.Start(route_number)
            route = []
            while not routing.IsEnd(index):
                route.append(routing.IndexToNode(index))
                index = assignment.Value(routing.NextVar(index))
            # print("Route: \n\n%s" % route)
            # print(json.dumps(route))
            print(route)
        else:
            # print("No solution found")
            print("[]")
            return
    else:
        # print('Specify an instance greater than 0.')
        print('[]')
        return


class CreateDistanceCallback(object):
    def __init__(self, matrix=None):
        if matrix is None:
            matrix = []
        self.matrix = matrix

    def distance(self, from_node, to_node):
        return int(self.matrix[from_node][to_node])


if __name__ == '__main__':
    main()
