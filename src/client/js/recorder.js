const startBtn= document.getElementById("startBtn");
const video= document.getElementById("preview");

let stream; 
let recorder;
let videoFile;

const handleDownload=async()=>{
	const a = document.createElement("a");
	a.href= videoFile;
	a.download="MyRecording.webm";
	document.body.appendChild(a);
	a.click();

	URL.revokeObjectURL(videoFile);
};

const handleStop=()=>{
	startBtn.innerText="Download Recording";
	startBtn.removeEventListener("click",handleStop);
	startBtn.addEventListener("click",handleDownload);
	recorder.stop();
};

const handleStart=()=>{
	startBtn.innerText="Stop Recording";
	startBtn.removeEventListener("click",handleStart);
	startBtn.addEventListener("click",handleStop);
	recorder= new window.MediaRecorder(stream,{mimeType:"video/webm"});
	recorder.ondataavailable=(e)=>{
		//URL은 파일을 가르키고 있음(브라우저의 메모리 상에 파일을 저장해두고 브라우저가 파일에 접근할 수 있도록 url을 줌)
		//createObjectURL은 브라우저 메모리엣만 가능한 URL을 만들어줌
		videoFile = URL.createObjectURL(e.data);
		video.srcObject= null ;
		video.src= videoFile;
		video.loop= true;
		video.play();
	}
	recorder.start();
}

const init= async()=>{
	stream = await navigator.mediaDevices.getUserMedia({
		video: {
			audio: false,
			video: true,
			width: 320,
			height: 180,
		},
	});
	video.srcObject = stream;
	video.play();
};

init();

startBtn.addEventListener("click",handleStart);