// 꼭 해야 할 2가지 Entry: 우리가 처리하고자 하는 파일들 (소스콛)
//entry파일을 변경/전환 시켜서 작업이 끝난 후에 그 파일을 ./assets/js 디렉토리에 파일명 main.js로저장
const path= require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports={
	entry: "./src/client/js/main.js",
	mode:"development",
	watch:true,
	plugins: [new MiniCssExtractPlugin({
		filename: "css/styles.css"
	})],
	output: {
		filename: "js/main.js",
		path: path.resolve(__dirname,"assets"),	
		//output folder를 build를 시작하기 전에 clean해줌
		clean: true,
	},
	module:{
		// 모든js파일을 가져다가 몇가지 변환을 시키
		rules: [
			{
				test: /\.js$/,
				use: {
					//loader: 파일을 변환하는 장치
					loader:'babel-loader',
					options:{
						presets: [
							['@babel/preset-env', { targets: "defaults" }]
						]
					}
				}
			},
			{
				test: /\.scss$/,
				//loader합치기 : 제일 마지막 loader부터 시작해야 함: webpack은 뒤에서부터 시작하기 때문
				use: [MiniCssExtractPlugin.loader,"css-loader","sass-loader"],
			}
		]
	}
}