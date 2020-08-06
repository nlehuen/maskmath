// custom graph component
Vue.component('graph', {

  props: ['traces', 'layout'],

  template: '<div ref="graph" class="graph" style="width: 700px; height: 700px;"></div>',

  methods: {

    graph() {
      Plotly.react(this.$refs.graph, this.traces, this.layout);
    },

  },

  mounted() {
    this.graph();
  },

  watch: {
    traces() {
      this.graph();
    },
    layout() {
      this.graph();
    }
  }
})

// slider component
Vue.component('slider', {
  props: ['value', 'min', 'max', 'step'],

  template: `<div><input type="range" :min="min" :max="max" :step="step" :value="value" @input="sliderChanged" class="slider"></input></div>`,

  methods: {
    sliderChanged: function(event) {
      let slider = event.target;
      this.$emit('input', slider.value)
    },
  }
})


// mask animation component
Vue.component('anim', {
  template: '<p5 src="js/sketch1.js" :data="{mask1: mask1, mask2: mask2, eout: eout, ein: ein}"></p5>',
  props: ['mask1', 'mask2', 'eout', 'ein']

})

// mask animation component with sidetext and caption
Vue.component('anim-with-caption', {

  template:   `
  <div class="graphic">
    <div class="graphic-container">

      <div class="row small-big-small twohundredpx">

        <div class="center">
            <div class="label">Contagious<br/>Person</div>
        </div>

        <anim :mask1="mask1" :mask2="mask2" :eout="eout" :ein="ein"></anim>

        <div class="center">
            <div class="label">Susceptible<br/>Person</div>
        </div>

      </div>

      <div class="caption">
        <slot></slot>
      </div>

    </div>
  </div>`,

  props: ['mask1', 'mask2', 'eout', 'ein']

})

// mask interactive component
/*
Vue.component('maskscenario', {

  template:   `
    <div class="anim row">
      <p5 src="sketch1.js" :data="{mask1: mask1, mask2: mask2}"></p5>
      <div class="center">
          <div>{{text1}}</div>
      </div>
      <div class="center">
          <div>{{text2}}</div>
      </div>
    </div>`,

  props: ['mask1', 'mask2', 'text1', 'text2']

})
*/

// mask interactive component
/*
Vue.component('tablelabel', {

  template:   `
    <div class="anim row heading">
      <div class="center">
          <div>{{text1}}</div>
      </div>
      <div class="center">
          <div>{{text2}}</div>
      </div>
      <div class="center">
          <div>{{text3}}</div>
      </div>
    </div>`,

  props: ['text1', 'text2', 'text3']

})
*/

// Creates a Vue <p5> Component
Vue.component('p5', {
  
  template: `<div class="center" v-observe-visibility="{
    callback: visibilityChanged,
    throttle: 300
  }"></div>`,

  props: ['src','data'],

  methods: {
    // loadScript from https://stackoverflow.com/a/950146
    // loads the p5 javscript code from a file
    loadScript(url, callback)
    {
      // Adding the script tag to the head as suggested before
      var head = document.head;
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;

      // Then bind the event to the callback function.
      // There are several events for cross browser compatibility.
      script.onreadystatechange = callback;
      script.onload = callback;

      // Fire the loading
      head.appendChild(script);
    },

    loadSketch() {
      this.myp5 = new p5(sketch(this));
    },

    visibilityChanged(isVisible, entry) {
      this.isVisible = isVisible;
      if (this.myp5.visibilityChanged) {
        this.myp5.visibilityChanged(isVisible);
      }
    }
  },

  data: function() {
    return {
      myp5: {},
      isVisible: false
    }
  },

  mounted() {
    this.loadScript(this.src, this.loadSketch);
  },

  watch: {
    data: {
      handler: function(val, oldVal) {
        if(this.myp5.dataChanged) {
          this.myp5.dataChanged(val, oldVal);
        }
      },
      deep: true
    }
  }

})


/* main Vue instance */
let app = new Vue({

  el: '#root',

  data: {
    eout: 0.5,  // mask effectiveness on exhale
    ein: 0.5,   // mask effectiveness on inhale
    p: 0.5,     // percent of people wearing masks
    R0: 2.5     // reproductive number R0
  },

  methods: {

    convertToPercent(val) {
      return Math.round(10 * 100 * val) / 10;
    },

    R0withmask(p) {
      return this.R0 * (1 - this.ein * p) * (1 - this.eout * p);
    },

    /*
    findRoot(R0, guess) { // Newton's method for finding equation root

      let estimate = guess;
      let maxIterations = 10;

      for (let i = 0; i < maxIterations; i++) {
        estimate = estimate - this.equation(R0, guess) / this.derivative(R0, guess);
      }

      return estimate;

    },

    equation(R0, a) {
      return 1 - Math.exp(-a * R0) - a;
    },

    derivative(R0, a) {
      return R0 * Math.exp(-a * R0) - 1;
    }
    */


  },

  computed: {

    indexArray() {
      return new Array(101).fill(0).map((e,i) => i / 100);
    },

    graph1Traces() {
      return [
        {
          x: this.indexArray,
          y: this.indexArray.map(p => 1 - (1 - this.ein * p) * (1 - this.eout * p) ),
          mode: 'lines',
          name: 'Entire Population',
          line: {
            color: 'purple'
          }
        },
        {
          x: this.indexArray,
          y: this.indexArray.map(p => this.eout * p ),
          mode: 'lines',
          name: 'Non-Mask Wearers',
          line: {
            color: 'red'
          }
        },
        {
          x: this.indexArray,
          y: this.indexArray.map(p => 1 - (1 - this.eout * p) * (1 - this.ein) ),
          mode: 'lines',
          name: 'Mask Wearers',
          line: {
            color: 'blue'
          }
        },
      ]
    },

    graph1Layout() {
      return {
        title:'Reduction in Virus Transmission Versus Mask Wearership',
        xaxis: {
          tickformat: ',.0%',
        },
        yaxis: {
          tickformat: ',.0%',
          range: [1, 0]
        }
      }
    },

    graph2Traces() {
      return [
        {
          x: this.indexArray,
          y: this.indexArray.map(p => this.R0withmask(p)),
          mode: 'lines',
          line: {
            color: 'purple'
          }
        }
      ]
    },

    graph2Layout() {
      return {
        title:'R0 Versus Mask Wearership',
        xaxis: {
          tickformat: ',.0%',
        },
        yaxis: {
          range: [0, 3]
        }
      }
    },

    graph3Traces() {
      return [
        {
          x: this.indexArray,
          y: this.indexArray.map(p => Math.max(1 + gsl_sf_lambert_W0(- this.R0withmask(p) * Math.exp(-this.R0withmask(p)))/this.R0withmask(p), 0) ),
          mode: 'lines',
          line: {
            color: 'purple'
          }
        }
      ]
    },

    graph3Layout() {
      return {
        title:'Infected Fraction Versus Mask Wearership',
        xaxis: {
          tickformat: ',.0%',
        },
        yaxis: {
          range: [0, 1],
          tickformat: '%',
        }
      }
    },

    d1() {
      return 0;
    },
    d2() {
      return this.eout;
    },
    d3() {
      return this.ein;
    },
    d4() {
      return 1 - (1 - this.eout) * (1 - this.ein);
    },
    l1() {
      return (1 - this.p) * (1 - this.p);
    },
    l2() {
      return this.p * (1 - this.p);
    },
    l3() {
      return (1 - this.p) * this.p;
    },
    l4() {
      return this.p * this.p;
    },
  }

})