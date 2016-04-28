
function filterData(buffer) {
    var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;

    var filter = offlineContext.createBiquadFilter();
    filter.type = "lowpass";

    source.connect(filter);
    filter.connect(offlineContext.destination);

    source.start(0);
    
    offlineContext.startRendering();
    offlineContext.oncomplete = function(e) {
        var filteredBuffer = e.renderedBuffer;
    };
}

function getPeaksAtThreshold(data, threshold) {
    var peaksArray = [];
    var length = data.length;
    for(var i = 0; i < length;) {
	if (data[i] > threshold) {
	    peaksArray.push(i);
	    // Skip forward ~ 1/4s to get past this peak.
	    i += 10000;
	}
	i++;
    }
    return peaksArray;
}

// Function used to return a histogram of tempo candidates.
function groupNeighborsByTempo(intervalCounts) {
    var tempoCounts = []
    intervalCounts.forEach(function(intervalCount, i) {
	// Convert an interval to tempo
	var theoreticalTempo = 60 / (intervalCount.interval / 44100 );

	// Adjust the tempo to fit within the 90-180 BPM range
	while (theoreticalTempo < 90) theoreticalTempo *= 2;
	while (theoreticalTempo > 180) theoreticalTempo /= 2;

	var foundTempo = tempoCounts.some(function(tempoCount) {
	    if (tempoCount.tempo === theoreticalTempo)
	    return tempoCount.count += intervalCount.count;
	});
	if (!foundTempo) {
	    tempoCounts.push({
		tempo: theoreticalTempo,
		count: intervalCount.count
	    });
	}
    });
}

// Function used to return a histogram of peak intervals
function countIntervalsBetweenNearbyPeaks(peaks) {
    var intervalCounts = [];
    peaks.forEach(function(peak, index) {
	for(var i = 0; i < 10; i++) {
	    var interval = peaks[index + i] - peak;
	    var foundInterval = intervalCounts.some(function(intervalCount) {
	    if (intervalCount.interval === interval)
		return intervalCount.count++;
	    });
	    if (!foundInterval) {
		intervalCounts.push({
		    interval: interval,
		    count: 1
		});
	    }
	}
    });
    return intervalCounts;
}
