var kMeans = require('kmeans-js');

function main() {
    var commuters = [[1,2],[3,4],[4,5],[6,7],[8,9],[0,0]],  // array of location of commuters
        cabs = [[0,3],[1,4],[2,3],[5,4]],		// array of location of cabs
        destination = [10,11],	// destination coordinates
        clusters = [],
        groups = [],
        disances = []; // two dimentional array
    var km = new kMeans({
        K: cabs.length
    });
    km.cluster(commuters);
    while (km.step()) {
        km.findClosestCentroids();
        km.moveCentroids();
        if (km.hasConverged()) break;
    }
    clusters = km.clusters;
    groups = km.centroids;
    // console.log('Finished in:', km.currentIteration, ' iterations');
    // console.log(km.centroids/*, km.clusters*/);
    allDistances = getDistanceBetweenGroupAndCabs(groups, cabs)  // Find the array of distances between group and cab
    var { optimalDistance, optimalRoute } = totalMinimumDistance(allDistances, groups, cabs) // Find optimal total distance and route travelled by all the cabs
    optimalDistance = addDestinationDistance(optimalDistance, groups, destination)  // Add total distance between group and destination to optimal distance
    console.log("optimalDistance",optimalDistance,"Approx.")
    // console.log("optimalRoute",optimalRoute)
    // console.log("clusters",clusters)
    // console.log("cabs",cabs)
    // console.log("groups",groups)
}

function getDistanceBetweenGroupAndCabs(groups, cabs) {
    var allDistances = []
    groups.forEach(function(group) {
        var d = [];
        cabs.forEach(cab => d.push(getDistance(group, cab)));
        allDistances.push(d);
    });
    return allDistances;
}

function totalMinimumDistance(distances, groups, cabs) {
    var optimalDistance = -1
    var optimalRoute = []
    var totalGroups = groups.length
    var totalCabs = cabs.length
    var totalAssignments = Math.pow(2, totalGroups * totalCabs)
    for (var i = 0; i < totalAssignments; i++) {    // Evaluating each way of assigning cabs to commuters
        var binRepr = i.toString(2);
        var binReprRev = binRepr.split('').reverse().join('');
        var {isValid, route} = isValidWayToAssignCab(binReprRev, totalGroups, totalCabs);
        if (isValid) {
            var totalDistance = calculateDistance(distances, route);
            if((optimalDistance == -1) || (totalDistance < optimalDistance)){
                optimalDistance = totalDistance;
            		optimalRoute = route;
            }
        }
    }
    return { optimalDistance, optimalRoute };
}

function isValidWayToAssignCab(binRepr, totalGroups, totalCabs) {
    var isValid = true
    var route = [];  // Stores which group is assgned which cab
    var groupVisited = new Array(totalGroups).fill(0);  // Keeps track of how many times a group is assigned cab
    var cabVisited = new Array(totalCabs).fill(0);   // Keeps track of how many times a cab is taken
    for (var i = 0; i < binRepr.length; i++) {
        var b = binRepr.charAt(i);
        var groupIndex = Math.floor(i/totalCabs);   // Index of the group which is assigned cab now
        var cabIndex = i%totalCabs;   // Index of the cab which is taken now
        if (b == '1') {
            groupVisited[groupIndex] += 1
            cabVisited[cabIndex] += 1
            route.push([groupIndex, cabIndex])
        }
    }
    for (var v = 0; v < groupVisited.length; v++) {    // Each group must be visited only once
        if (groupVisited[v] != 1) {
            isValid = false
            break;
        }
    }
    for (var v = 0; v < cabVisited.length; v++) {   // Each cab must be visited atmost once
        if (cabVisited[v] > 1) {
            isValid = false
            break;
        }
    }
    return {isValid, route }
}

function calculateDistance(distances, route) {
    var totalDistance = 0
    for (var r = 0; r < route.length; r++) {
        var groupIndex = Math.floor(route[r][0])
        var cabIndex = Math.ceil(route[r][1])
        totalDistance += distances[groupIndex][cabIndex]
    }
    return totalDistance
}

function addDestinationDistance(optimalDistance, groups, destination) {
    if (optimalDistance == -1) {
        return optimalDistance
    }
    var totalDistance = 0
    for (var g = 0; g < groups.length; g++) {
        totalDistance += getDistance(groups[g], destination)
    }
    optimalDistance += totalDistance
    return optimalDistance
}

function getDistance(a, b) {
    var ret = Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2);
    ret = Math.sqrt(ret);
    return ret
}

main();
