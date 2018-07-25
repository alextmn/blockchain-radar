new Vue({
    el: "#app",
    data: {
      electreChoices: [],
      choices: [{
        name: "Hyperledger Fabric"
      }, {
        name: "R3 Corda"
      }, {
        name: "Quorum"
      }, {
        name: "Ethereum"
      }],
      indicators: [{
          name: "Trusted Parties",
          negativeIndiciator: false,
          weight: 2,
          qualitative: false
        },
        {
          name: "Secure Communications",
          negativeIndiciator: false,
          weight: 1,
          qualitative: false
        },
        {
          name: "Membership / Identity",
          negativeIndiciator: false,
          weight: 2,
          qualitative: false
        },
        {
            name: "Coin / Token Based",
            negativeIndiciator: false,
            weight: 5,
            qualitative: false
        },
        {
          name: "Chronologically Ordered",
          negativeIndiciator: false,
          weight: 1,
          qualitative: false
        },
        {
          name: "Ease of implementation",
          negativeIndiciator: false,
          weight: 5,
          qualitative: false
        },
        {
            name: "Platform Reputation",
            negativeIndiciator: false,
            weight: 3,
            qualitative: false
          },
          {
              name: "High Tx/second",
              negativeIndiciator: false,
              weight: 3,
              qualitative: false
          }
      ],
      decisionMatrix: [
        [5, 5, 5, 1, 1, 2, 4, 4 ],
        [5, 5, 2, 4, 2, 4, 3, 4 ],
        [3, 2, 1, 5, 5, 2, 2, 4 ],
        [1, 1, 1, 5, 5, 3, 3, 1 ],
      ],
      sortedChoices: [],
      scoredChoices: [],
      result: "",
      isLoading: false,
      isVisible: false
    },
    computed: {
      canDrawDecisionMatrix() {
        return this.indicators.length > 1 && this.choices.length > 1;
      },
      isChoicesLimitExceeded() {
        return this.choices.length === 7;
      },
      isIndicatorsLimitExceeded() {
        return this.indicators.legnth === 7;
      }
    },
    methods: {
      addChoice() {
        this.choices.push({
          name: `name ${this.choices.length + 1}`
        });
        this.createDecisionMatrix();
      },
      addIndicator() {
        this.indicators.push({
          name: `name ${this.indicators.length + 1}`,
          negativeIndiciator: false,
          weight: 1.0,
          qualitative: false
        });
        this.createDecisionMatrix();
      },
      createDecisionMatrix() {
        // make a backup of old values
        let backup = this.decisionMatrix;
  
        // empty matrix
        this.decisionMatrix = [];
  
        // create an empty matrix
        for (var choiceIndex in this.choices) {
          this.decisionMatrix[choiceIndex] = Array(this.indicators.length);
        }
  
        // fill it with zeros
        for (var i = 0; i < this.choices.length; i++) {
          for (var j = 0; j < this.indicators.length; j++) {
            this.decisionMatrix[i][j] = 1;
          }
        }
  
        // refill it with backup data
        for (var i = 0; i < backup.length; i++) {
          for (var j = 0; j < backup[i].length; j++) {
            this.decisionMatrix[i][j] = backup[i][j];
          }
        }
      },
      CallMe() {
        //this.isLoading = true;
        this.isVisible = true;
        let request = {
          A: this.choices.map(choice => choice.name),
          X: this.indicators.map(indecies => indecies.name),
          XP: this.indicators.map(
            indecies => (indecies.negativeIndiciator ? 0 : 1)
          ),
          D: this.decisionMatrix,
          W: this.indicators.map(indecies => indecies.weight)
        };

        range = (start, end) => {
          return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
        }
        //https://www.programcreek.com/java-api-examples/index.php?source_dir=ODCM-master/odcm.server/src/odcm/logic/functions/Topsis.java
        let cols = range(0, request.D[0].length -1);
        let rows = range(0, request.D.length -1);
        let total = cols.map( i => 
          Math.sqrt( rows.reduce ((acc, j) => acc + Math.pow(request.D[j][i], 2), 0 ))
        );
        let normilze = rows.map( i => 
            cols.map(j=> request.D[i][j]/total[j])
        );
        let v = rows.map( i => 
          cols.map(j=> request.W[j] * normilze[i][j])
        );
        let positiveIdeal = cols.map( i => 
          rows.reduce(((max, j)=> Math.max(v[j][i] , max) ),0) 
        );
        let negativeIdeal = cols.map( i => 
          rows.reduce(((min, j)=> Math.min(v[j][i] , min) ),999) 
        );
        let s1 = rows.map( i => 
          Math.sqrt( cols.reduce((acc, j)=> acc + Math.pow(v[i][j] - positiveIdeal[j], 2), 0))
        );
        let s2 = rows.map( i => 
          Math.sqrt( cols.reduce((acc, j)=> acc + Math.pow(v[i][j] - negativeIdeal[j], 2),  0))
        );
        let performace = rows.map( i=> s2[i] / (s1[i] + s2[i]) );
        let pairs=  rows.map( i => new Object({a:request.A[i], b:performace[i]}))
                    .sort( (a,b) => b.b - a.b);
        this.sortedChoices = pairs.map( a => a.a );
        this.scoredChoices = pairs.map( a => a.b.toFixed(4) );
      },
    }
});