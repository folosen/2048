var animation={
	WIDTH:116,//width+margin 100+16
	HEIGHT:116,//height+margin 100+16
	duration:70,//总时间
	STEPS:10,//固定总步数
	steps:10,//步数计数器
	interval:0,//每步时间间隔
	timer:null,//保存定时器编号
	tasks:[],//保存所有需要移动的div对象和移动的step
	init:function(){//初始化，计算interval
		this.interval=this.duration/this.steps;
	},
	//添加移动任务方法：
	//根据div的当前位置和目标位置行号和列号，计算行列两个方向上每步位移。
	addTask:function(div,rFrom,cFrom,rTo,cTo){
		var rstep=(rTo-rFrom)*this.HEIGHT/this.steps;
		var cstep=(cTo-cFrom)*this.WIDTH/this.steps;
		this.tasks.push(//将任务加入任务列表
			{div:div,rstep:rstep,cstep:cstep}
		);
	},
	//将任务中，每个对象移动一步的方法
	moveStep:function(callback){
		for(var i=0;i<this.tasks.length;i++){
			var obj=this.tasks[i];
			var style=getComputedStyle(obj.div);
			//将每个div在top和left方向上移动指定距离
			obj.div.style.top=
				parseFloat(style.top)+obj.rstep+"px";
			obj.div.style.left=
				parseFloat(style.left)+obj.cstep+"px";
		}
		this.steps--;
		if(this.steps==0){//如果步数走完
			//就停止定时器，清除所有div的left值，使其回到原位，再重置步数计数器，再清空任务列表。
			clearInterval(this.timer);
			game.setCellStyle();
			this.steps=this.STEPS;
			this.tasks=[];
			//动画结束后，才能继续生成随机数和更新界面
			callback();
		}
	},
	start:function(callback){
		//启动动画方法，将moveStep方法放入定时器，提前绑定this为animation对象，同时绑定动画执行后要自动调用的函数对象。
		this.timer=setInterval(
			this.moveStep.bind(this,callback),
			this.interval
		);
	}
}