let App = new Vue({
	el: '#app',
	data: {
    collection:[],
    decks:[],
    collectionPage:0,
    allCardList:{},
		curDeckID:0,
  },
	methods: {
		enterQueue: function(){
      sendThroughWebSocket(JSON.stringify({
        type:"enterQueue",
        data:{
					deckID:this.curDeckID
				}
      }))
		}
	},
})
if(localStorage.allCardList){
  App.allCardList = localStorage.allCardList
}
