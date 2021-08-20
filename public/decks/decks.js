//TODO: Setup overlay, and connect it to keywords/dream variants

let App = new Vue({
	el: '#app',
	data: {
    collection:[],
    decks:[],
    collectionPage:0,
    allCardList:{},
		curDeckID:0,
		tempDisplayCard:null,
		keywordData:{},
		overlayText:'',
  },
	methods: {
    calcX: function(i){
      return (100+(i%4+1)*150)+'px'
    },
		calcKeywordX: function(card,i){
			let x = 100
			if(card.dreamVariant||card.awakenedDreamVariant){
				x-=20
			}
			x-=i*20
			return x+'px'
		},
    calcY: function(i){
      return i<=3?(200)+'px':(450)+'px'
    },
		incColPage: function(){
			if(this.collectionPage<this.relevantCollection.length/8-1){
				this.collectionPage+=1
			}
		},
		decColPage: function(){
			if(this.collectionPage>0){
				this.collectionPage-=1
			}
		},
		onMouseOverCollection: function(name,i){
			let x = 100+(i%4+1)*150
			let y = i<=3?200:450
			x += 140
			y -= 20
			x+='px'
			y+='px'
			this.tempDisplayCard = {card:this.allCardList[name],x,y,name}
		},
		onMouseOverDeck: function(name, i){
			//todo add functinoality for cards in the sidebar
			let x = 'calc(88vw - 150px - 128px - 10px)'
			let y = i*30+150
			y+='px'
			this.tempDisplayCard = {card:this.allCardList[name],x,y,name}
		},
		getSelectable: function(card){
			if(!this.decks[this.curDeckID]){
				return ""
			}
			if(!this.decks[this.curDeckID].cards[card[0]]){
				return "selectable"
			}
			if(card[1].amount==this.decks[this.curDeckID].cards[card[0]].amount){
				return ""
			}else if(this.rarityData&&this.decks[this.curDeckID].cards[card[0]].amount==this.rarityData[this.allCardList[card[0]].rarity].maxPerDeck){
				return ""
			}else{
				return "selectable"
			}
		},
		addToDeck: function(card){
			sendThroughWebSocket(JSON.stringify({type:"addCardDeck",data:{deckID:this.curDeckID,card:card[0]}}))
		},
		removeFromDeck: function(card){
			sendThroughWebSocket(JSON.stringify({type:"removeCardDeck",data:{deckID:this.curDeckID,card}}))
		},
		changeFaction: function(factionPos,newFaction){
			if(this.decks[this.curDeckID].factions[factionPos]==newFaction){
				return false
			}
			if(confirm('Changing factions will remove cards of the previous faction from your deck. Continue?')){
				sendThroughWebSocket(JSON.stringify({type:"setFaction",data:{factionPos,newFaction,deckID:this.curDeckID}}))
				return true
			}
			return false
		},
		getAmountRemaining: function(card,baseAmount){
			if(!this.decks[this.curDeckID]||!this.decks[this.curDeckID].cards[card]){
				return baseAmount
			}
			return baseAmount - this.decks[this.curDeckID].cards[card].amount
		}
	},
  computed: {
    relevantCollection: function() {
			let relevantCol = []
			for(let i=0;i<this.collection.length;i++){
				if(this.allCardList[this.collection[i][0]].factions[0]==+!this.decks[this.curDeckID].factions[0]){
					continue
				}
				if(this.allCardList[this.collection[i][0]].factions[1]==+!this.decks[this.curDeckID].factions[1]){
					continue
				}
				relevantCol.push(this.collection[i])
			}
			return relevantCol
    }
  },
})
if(localStorage.allCardList){
  App.allCardList = JSON.parse(localStorage.allCardList)
}
