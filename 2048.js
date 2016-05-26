if(!Function.prototype.bind){
	Function.prototype.bind=function(obj){
		var fun=this;
		var args=
			Array.prototype.slice.call(arguments,1);
		return function(){
			fun.apply(obj,args.concat(
				Array.prototype.slice.call(arguments)
			));
		}
	}
}
function $(id){
	return document.getElementById(id);
}
var game={
	data:[],//保存4x4个单元格中数据的二维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,
	top:0,//最高分
	state:1,//游戏的状态：进行中:1  结束:0
	RUNNING:1,//运行状态
	GAMEOVER:0,//结束状态
	PLAYING:2,//动画播放中状态
	init:function(){//初始化所有格子div的html代码
		//设置id为gridPanel的宽为: CN*116+16+"px";
		$("gridPanel").style.width=this.CN*116+16+"px";
		//设置id为gridPanel的高为: RN*116+16+"px";
		$("gridPanel").style.height=this.RN*116+16+"px";
		var grids=[];
		var cells=[];
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				grids.push(
				'<div id="g'+r+c+'" class="grid"></div>'
				);
				cells.push(
				'<div id="c'+r+c+'" class="cell"></div>'
				);
			}
		}
		$("gridPanel").innerHTML=grids.join("")
			                    +cells.join("");
		this.setCellStyle();
	},
	setCellStyle:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var div=$("c"+r+c);
				div.style.top=16+r*116+"px";
				div.style.left=16+c*116+"px";
			}
		}
	},
	start:function(){//开始游戏方法
		this.init();//生成游戏界面
		animation.init();
		for(var r=0;r<this.RN;r++){
			this.data.push([]);//在data中压入一个空数组
			//	c从0开始，到<CN结束，遍历行中每个格
			for(var c=0;c<this.CN;c++){
				this.data[r][c]=0;//设置data中当前位置为0
			}
		}
		this.score=0;//初始化分数为0
		$("top").innerHTML=this.getTop();
		this.state=this.RUNNING;//初始化游戏状态为运行
		$("gameOver").style.display="none";
		this.randomNum();//生成1个随机数
		this.randomNum();//再生成1个随机数
		this.updateView();//更新页面元素
		//绑定键盘事件:当键盘按下时，自动触发
		document.onkeydown=function(){//自动获得事件对象
			if(this.state==this.RUNNING){
				var e=window.event||arguments[0];
					//  IE8           IE9+或其它
				switch(e.keyCode){//判断按键号
					case 37: this.moveLeft(); break;
					case 38: this.moveUp(); break;
					case 39: this.moveRight(); break;
					case 40: this.moveDown(); break;
				}
			}
		}.bind(this);
	},
	updateView:function(){//游戏内容写入界面
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var div=$("c"+r+c);
				if(this.data[r][c]==0){
					div.innerHTML="";
					div.className="cell";
				}else{//	否则
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];
				}
			}
		}
		//找到id为"score"的span，直接修改其内容为游戏的score属性值
		$("score").innerHTML=this.score;

		//调用isGameOver方法,如果返回true
		if(this.isGameOver()){
		//	修改游戏状态为GAMEOVER
			this.state=this.GAMEOVER;
		//	找到id为finalScore的span，设置内容为游戏的分数
			$("finalScore").innerHTML=this.score;
		//	找到id为gameOver的div，显示出来
			$("gameOver").style.display="block";
			if(this.score>this.getTop()){
				this.setTop(this.score);
			}
		}
	},
	setTop:function(value){//将value写入cookie中的top变量
		var now=new Date();
		now.setFullYear(now.getFullYear()+1);
		document.cookie="top="+value+";expires="+
			            now.toGMTString();
	},
	getTop:function(){//从cookie中读取top变量的值
		var top=parseInt(document.cookie.slice(4));
		return isNaN(top)?0:top;
	},
	isGameOver:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0){
					return false;
				}else if(c!=this.CN-1
				&&this.data[r][c]==this.data[r][c+1]){
					return false;
				}else if(r!=this.RN-1
				&&this.data[r][c]==this.data[r+1][c]){
					return false;
				}
			}
		}//(遍历结束)
		return true;//返回true
	},
	randomNum:function(){//生成1个随机数的方法
		for(;;){//死循环
			var r=Math.floor(Math.random()*this.RN);
			var c=Math.floor(Math.random()*this.CN);
			if(this.data[r][c]==0){
				this.data[r][c]=Math.random()<0.5?2:4;
				break;
			}
		}
	},
	move:function(iterator){//iterator专门执行for的函数
		var before=this.data.toString();
		iterator.call(this);
		var after=this.data.toString();
		if(before!=after){
			this.state=this.PLAYING;
			animation.start(function(){
				this.randomNum();
				this.updateView();
				this.state=this.RUNNING;
			}.bind(this));
		}
	},
	moveLeft:function(){//遍历每一行，针对每一行执行左移
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveLeftInRow(r);
			}
		});
	},
	moveLeftInRow:function(r){
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getRightInRow(r,c);
			if(nextc==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[r][nextc];
				this.data[r][nextc]=0;
				animation.addTask(
					$("c"+r+nextc),r,nextc,r,c);
				c--;
			}else if(this.data[r][c]
						==this.data[r][nextc]){
				this.data[r][c]*=2;
				this.data[r][nextc]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+r+nextc),r,nextc,r,c);
			}
		}
	},
	getRightInRow:function(r,c){
		for(var nextc=c+1;nextc<this.CN;nextc++){
			if(this.data[r][nextc]!=0){
				return nextc;
			}
		}//(遍历结束)
		return -1;
	},
	moveRight:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveRightInRow(r);
			}//(遍历结束)
		});
	},
	moveRightInRow:function(r){//遍历data中r行每个元素
		for(var c=this.CN-1;c>0;c--){
			var prevc=this.getLeftInRow(r,c);
			if(prevc==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[r][prevc];
				this.data[r][prevc]=0;
				animation.addTask(
					$("c"+r+prevc),r,prevc,r,c);
				c++;
				
			}else if(this.data[r][c]
						==this.data[r][prevc]){
				this.data[r][c]*=2;
				this.data[r][prevc]=0;
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+r+prevc),r,prevc,r,c);
			}
		}
	},
	getLeftInRow:function(r,c){
		for(var prevc=c-1;prevc>=0;prevc--){
			if(this.data[r][prevc]!=0){
				return prevc;
			}
		}//(遍历结束)
		return -1;//返回-1
	},
	moveUp:function(){
		this.move(function(){
		  for(var c=0;c<this.CN;this.moveUpInCol(c),c++);
		});
	},
	moveUpInCol:function(c){//仅移动指定的一行
		for(var r=0;r<this.RN-1;r++){
			var nextr=this.getDownInCol(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c);
				r--;
			}else if(this.data[r][c]
						==this.data[nextr][c]){
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c);
			}
		}
	},
	getDownInCol:function(r,c){
		for(var nextr=r+1;nextr<this.RN;nextr++){
			if(this.data[nextr][c]!=0){
				return nextr;
			}
		}
		return -1;
	},
	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.RN;this.moveDownInCol(c),c++);
		});
	},
	moveDownInCol:function(c){
		for(var r=this.RN-1;r>0;r--){
			var prevr=this.getUpInCol(r,c);
			if(prevr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[prevr][c];
				this.data[prevr][c]=0;
				animation.addTask(
					$("c"+prevr+c),prevr,c,r,c);
				r++;
			}else if(this.data[r][c]
						==this.data[prevr][c]){
				this.data[r][c]*=2;
				this.data[prevr][c]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+prevr+c),prevr,c,r,c);
			}
		}
	},
	getUpInCol:function(r,c){
		for(var prevr=r-1;prevr>=0;prevr--){
			if(this.data[prevr][c]!=0){
				return prevr;
			}
		}
		return -1;
	}
}
//页面加载后：页面加载后自动触发！
window.onload=function(){
	game.start();
}