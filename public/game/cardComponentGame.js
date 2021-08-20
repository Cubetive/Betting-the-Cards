Vue.component('card', {
    data: function () {
        return {
            tempCard: null,
        }
    },
    methods: {
        setTempCard: function (cardName) {
            this.tempCard = this.getCardData(cardName)
            this.tempCard.cardFrameState = 'normal'
            this.tempCard.name = cardName
        },
        calcKeywordX: function (i) {
            let x = 100
            if (this.card.dreamVariant || this.card.awakenedDreamVariant) {
                x -= 20
            }
            x -= i * 20
            return x + 'px'
        },
        calcStyle: function () {
            style = {}
            if ((this.card.cardFrameState == 'highlighted' || this.card.cardFrameState == 'targetable' || (this.card.cardFrameState == 'selected' && this.zone != 'stack') )&&!this.card.emittingAction) {
                style["cursor"] = "pointer"
            }
            return style
        },
        getCardFrame: function (state, type) {
            if (type == 'character') {
                switch (state) {
                    case 'normal':
                        return normalCardFrame
                    case 'highlighted':
                        return highlightedCardFrame
                    case 'selected':
                        return selectedCardFrame
                    case 'targetable':
                        return targetableCardFrame
                    case 'targeted':
                        return targetedCardFrame
                    case 'dying':
                        return dyingCardFrame
                    default:
                        return null
                }
            } else if (type == 'spell') {
                switch (state) {
                    case 'normal':
                        return normalSpellCardFrame
                    case 'highlighted':
                        return highlightedSpellCardFrame
                    case 'selected':
                        return selectedSpellCardFrame
                    case 'dying':
                        return dyingSpellCardFrame
                    default:
                        return null
                }
            }
        },
        handleClick: function (event) {
            if (!this.active || this.card.cardFrameState == "normal") return;
            if (this.zone == 'hand') {
                this.$emit('set-held-card', event, this.pos)
            } else if (this.zone == 'allySlots') {
                if (this.card.cardFrameState == 'targetable') {
                    this.$emit('card-selected', this.pos, false)
                } else if (this.card.cardFrameState == 'selected' || this.card.cardFrameState == 'highlighted') {
                    this.$emit('toggle-attacking', this.pos)
                }
            } else if (this.zone == 'enemySlots') {
                if (this.card.cardFrameState == 'targetable') {
                    this.$emit('card-selected', this.pos, true)
                }
            } else if (this.zone == "beingPlayed") {
                if (this.card.cardFrameState == "selected") {
                    this.$emit("cancel-card-played")
                }
            }
        },
        setOverlayText: function (text) {
            this.$emit('set-overlay-text', text)
        }
    },
    props: ['card', 'opacity', 'getCardData', 'getKeywordData', 'pos', 'zone','active'],
    template:
        `
  <span v-on:mousedown.left="handleClick" :style="{'opacity':opacity}">
  <div :style="calcStyle()">
      <div class = "card" v-if="card.type=='character'">
        <img draggable = "false" :src = "getCardFrame(card.cardFrameState,card.type)"/>
        <div class = "cardName">{{card.name}}</div>
        <div class = "cardCost">{{card.publicGeoCost}}</div>
        <div class = "cardHP" style = "color:green">{{card.publicHP!=null?card.publicHP:card.origHP}}</div>
        <div class = "cardAttack" style="color:red">{{card.publicAttack!=null?card.publicAttack:card.origAttack}}</div>
        <div class = "cardAbility">
          <span v-for="part in card.baseText">
            <span v-if="part.type=='plainText'">{{part.value}}</span>
            <span v-if="part.type=='cardName'" style="color:blue" v-on:mouseover = "setTempCard(part.name)"  v-on:mouseleave="tempCard=null">{{part.value}}</span>
          </span>
        </div>
        <div v-if="card.dreamVariant" class = "cardDreamVariant">
          <img style="height: 16px; width: 16px" v-on:click.right.prevent="$emit('set-overlay-text','Dream Variants: '+getKeywordData('Dream Variant').description)" v-on:mouseover = "setTempCard(card.dreamVariant)" v-on:mouseleave="tempCard=null" src = "images/Faction0.png"/>
        </div>
        <div v-if="card.awakenedDreamVariant" class = "cardDreamVariant">
          <img style="height: 16px; width: 16px" v-on:click.right.prevent="$emit('set-overlay-text','Awakened Dream Variants: '+getKeywordData('Awakened Dream Variant').description)" v-on:mouseover = "setTempCard(card.dreamVariant)" v-on:mouseleave="tempCard=null" src = "images/Faction0.png"/>
        </div>
        <div v-if="card.publicKeywords&&card.publicKeywords.length>0">
          <div v-for="(keyword,i) in card.publicKeywords" v-on:click.right.prevent="$emit('set-overlay-text',keyword+': '+getKeywordData(keyword).description)" class = "cardKeyword" :style = "{left:calcKeywordX(i)}">
            <img style="height: 16px; width: 16px" src = "images/Faction0.png"/>
          </div>
        </div>
      </div>
      <div class = "card" v-if="card.type=='spell'">
        <img draggable="false" :src = "getCardFrame(card.cardFrameState,card.type)"/>
        <div class = "cardName">{{card.name}}</div>
        <div class = "cardCost">{{card.publicGeoCost}}</div>
        <div class = "cardAbility">
          <span v-for="part in card.baseText">
            <span v-if="part.type=='plainText'">{{part.value}}</span>
            <span v-if="part.type=='cardName'" style="color:darkblue" v-on:mouseover="setTempCard(part.name)" v-on:mouseleave="tempCard=null">{{part.value}}</span>
          </span>
        </div>
        <div class = "cardSoulCost">{{card.publicSoulCost}}</div>
      </div>
      <div v-if='tempCard!=null'>
        <card
        style = "position:absolute;"
        :style = '{left: "120px",top:"-20px","z-index":1235}'
        :card = 'tempCard'
        :opacity = '0.8'
        :get-card-data = 'getCardData'
        :active = 'false'
        :get-keyword-data = 'getKeywordData'
        v-on:set-overlay-text = 'setOverlayText'
        />
      </div>
    </div>
</span>`
})
