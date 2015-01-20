// var AudioHandler = function() {

//     var waveData = []; //waveform - from 0 - 1 . no sound is 0.5. Array [binCount]
//     var levelsData = []; //levels of each frequecy - from 0 - 1 . no sound is 0. Array [levelsCount]
//     var level = 0; // averaged normalized level from 0 - 1
//     var bpmTime = 0; // bpmTime ranges from 0 to 1. 0 = on beat. Based on tap bpm
//     var ratedBPMTime = 550; //time between beats (msec) multiplied by BPMRate
//     var levelHistory = []; //last 256 ave norm levels
//     var bpmStart;

//     var BEAT_HOLD_TIME = 40; //num of frames to hold a beat
//     var BEAT_DECAY_RATE = 0.98;
//     var BEAT_MIN = 0.15; //a volume less than this is no beat

//     //BPM STUFF
//     var count = 0;
//     var msecsFirst = 0;
//     var msecsPrevious = 0;
//     var msecsAvg = 633; //time between beats (msec)

//     var timer;
//     var gotBeat = false;
//     var beatCutOff = 0;
//     var beatTime = 0;


//     var freqByteData; //bars - bar data is from 0 - 256 in 512 bins. no sound is 0;
//     var timeByteData; //waveform - waveform data is from 0-256 for 512 bins. no sound is 128.
//     var levelsCount = 16; //should be factor of 512

//     var binCount; //512
//     var levelBins;

//     var isPlayingAudio = false;

//     var source;
//     var buffer;
//     var audioBuffer;
//     var dropArea;
//     var audioContext;
//     var analyser;


//     var prevTickWasBeat = false;
//     var beatArray = [];
//     var bpms = [];
//     var currentBpm = {
//       value: 0,
//       from: 0
//     };
//     window.b = beatArray;
//     window.bpms = bpms;

//     function init() {

//         //EVENT HANDLERS
//         events.on("update", update);

//         audioContext = new window.webkitAudioContext();
//         analyser = audioContext.createAnalyser();
//         analyser.smoothingTimeConstant = 0.8; //0<->1. 0 is no time smoothing
//         analyser.fftSize = 1024;
//         analyser.connect(audioContext.destination);
//         binCount = analyser.frequencyBinCount; // = 512

//         levelBins = Math.floor(binCount / levelsCount); //number of bins in each level

//         freqByteData = new Uint8Array(binCount);
//         timeByteData = new Uint8Array(binCount);

//         var length = 256;
//         for (var i = 0; i < length; i++) {
//             levelHistory.push(0);
//         }

//     }

//     function initSound() {
//         source = audioContext.createBufferSource();
//         source.connect(analyser);
//     }

//     function loadBuffer(buffer) {
//       audioBuffer = buffer;
//       startSound();
//     }

//     //load sample MP3

//     function loadSampleAudio() {

//         stopSound();

//         initSound();


//         // Load asynchronously
//         var request = new XMLHttpRequest();
//         request.open("GET", ControlsHandler.audioParams.sampleURL, true);
//         request.responseType = "arraybuffer";

//         request.onload = function() {
//           audioContext.decodeAudioData(request.response, loadBuffer);
//         };
//         request.send();
//     }

//     function onTogglePlay() {

//         if (ControlsHandler.audioParams.play) {
//             startSound();
//         } else {
//             stopSound();
//         }
//     }

//     function startSound() {
//         source.buffer = audioBuffer;
//         source.loop = true;
//         source.start(0.0);
//         isPlayingAudio = true;
//         window.s = source;
//         //startViz();

//         $("#preloader").hide();
//     }

//     function stopSound() {
//         isPlayingAudio = false;
//         if (source) {
//             source.stop(0);
//             source.disconnect();
//         }
//         // debugCtx.clearRect(0, 0, debugW, debugH);
//     }

//     function onUseSample() {
//         if (ControlsHandler.audioParams.useSample) {
//             loadSampleAudio();
//             ControlsHandler.audioParams.useMic = false;
//         } else {
//             stopSound();
//         }
//     }
//     //load dropped MP3

//     function onMP3Drop(evt) {

//         //TODO - uncheck mic and sample in CP

//         ControlsHandler.audioParams.useSample = false;
//         ControlsHandler.audioParams.useMic = false;

//         stopSound();

//         initSound();

//         var droppedFiles = evt.dataTransfer.files;
//         var reader = new FileReader();
//         reader.onload = function(fileEvent) {
//             var data = fileEvent.target.result;
//             onDroppedMP3Loaded(data);
//         };
//         reader.readAsArrayBuffer(droppedFiles[0]);
//     }

//     //called from dropped MP3

//     function onDroppedMP3Loaded(data) {

//         if (audioContext.decodeAudioData) {
//             audioContext.decodeAudioData(data, function(buffer) {
//                 audioBuffer = buffer;
//                 startSound();
//             }, function(e) {
//                 console.log(e);
//             });
//         } else {
//             audioBuffer = audioContext.createBuffer(data, false);
//             startSound();
//         }
//     }


//     function getBpm() {
//       var errorMargin = 0, //ms
//           minBeatCount = 16;

//       if(beatArray.length - currentBpm.from < minBeatCount) {
//         return currentBpm;
//       }
//       beatArray = beatArray.slice(beatArray.length - minBeatCount);
//       var diffs = _.map(beatArray, function(data) {
//         return data.diff;
//       });
//       // console.log(beatArray.length - currentBpm.from);
//       // console.log(diffs.length);

//       for(var i=1, l=diffs.length, sum = diffs[0]; i<l; i++) {
//         if(Math.abs(diffs[i]-diffs[i-1]) > errorMargin) {
//           // console.warn(beatArray[i-1 + currentBpm.from], beatArray[i + currentBpm.from]);
//           break;
//         }
//         sum += diffs[i];
//       }

//       if(i === l) {
//         // we don't have aninitial bpm... calculate it!
//         if(currentBpm.value === 0) {
//           // console.log('ooooh yeah!');
//           var average = sum / l;
//           var bpmValue = Math.round(60 * average / 1000);

//           return {
//             value: bpmValue,
//             from: beatArray.length - minBeatCount + i
//           };
//         }

//         return currentBpm;
//       }

//       // console.log('new beat!!!!!');

//       var newDiffs = diffs.slice(i-1),
//           average = 0;

//       sum = 0;

//       _.each(newDiffs, function(d) {
//         sum += d;
//       });

//       average = sum / newDiffs.length;
//       var bpmValue = Math.round(60 * average / 1000);

//       return {
//         value: bpmValue,
//         from: beatArray.length - minBeatCount + i
//       }
//     }

//     function addBeat(beatData) {
//       beatArray.push(beatData);
//       var newBpm = getBpm();
//       if(newBpm.value !== currentBpm.value) {
//         bpms.push(newBpm);
//         window.c = currentBpm = newBpm;
//         console.error('bpm change:', newBpm.value);
//       }
//     }

//     function originalOnBeat(level) {
//       events.emit("onBeat");

//       var now = performance.now(),
//           diff = 0;

//       if(beatArray.length > 1) {
//         diff = now - beatArray[beatArray.length - 2].time;
//       }

//       addBeat({
//         time: now,
//         diff: diff,
//         level: level
//       });

//       // console.info('BEAT');
//     }
//     var maxBpm = 300;
//     var onBeat = _.throttle(originalOnBeat, 60 / maxBpm * 1000, {leading:true});


//     //called every frame
//     //update published viz data

//     function update() {



//         if (!isPlayingAudio) return;

//         //GET DATA
//         analyser.getByteFrequencyData(freqByteData); //<-- bar chart
//         analyser.getByteTimeDomainData(timeByteData); // <-- waveform

//         // console.log(freqByteData);

//         //normalize waveform data
//         // for (var i = 0; i < binCount; i++) {
//         //     waveData[i] = ((timeByteData[i] - 128) / 128) * ControlsHandler.audioParams.volSens;
//         // }
//         //TODO - cap levels at 1 and -1 ?

//         //normalize levelsData from freqByteData
//         for (var i = 0; i < levelsCount; i++) {
//             var sum = 0;
//             for (var j = 0; j < levelBins; j++) {
//                 sum += freqByteData[(i * levelBins) + j];
//             }
//             levelsData[i] = sum / levelBins / 256 * ControlsHandler.audioParams.volSens; //freqData maxs at 256

//             //adjust for the fact that lower levels are percieved more quietly
//             //make lower levels smaller
//             //levelsData[i] *=  1 + (i/levelsCount)/2;
//         }
//         //TODO - cap levels at 1?

//         //GET AVG LEVEL
//         var sum = 0;
//         for (var j = 0; j < levelsCount; j++) {
//             sum += levelsData[j];
//         }

//         level = sum / levelsCount;

//         levelHistory.push(level);
//         levelHistory.shift(1);

//         //BEAT DETECTION

//         bpmTime = (new Date().getTime() - bpmStart) / msecsAvg;

//         if (!prevTickWasBeat && level > beatCutOff && level > BEAT_MIN) {
//             onBeat(level);
//             prevTickWasBeat = true;
//             beatCutOff = level * 1.1;
//             beatTime = 0;
//         } else {
//             prevTickWasBeat = false;
//             if (beatTime <= ControlsHandler.audioParams.beatHoldTime) {
//                 beatTime++;
//             } else {
//                 beatCutOff *= ControlsHandler.audioParams.beatDecayRate;
//                 beatCutOff = Math.max(beatCutOff, BEAT_MIN);
//             }
//         }
//     }


//     return {
//         onMP3Drop: onMP3Drop,
//         onUseSample: onUseSample,
//         update: update,
//         init: init,
//         level: level,
//         levelsData: levelsData,
//         onTogglePlay: onTogglePlay
//     };

// }();
