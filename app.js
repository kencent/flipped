App({
    onLaunch: function () {
    	console.log('初始化完成');
    },
    onShow: function () {
      	console.log('我显示出来了');
    },
    onHide: function () {
        console.log('我被隐藏了');
    },
    globalData: 'I am global data'
  });