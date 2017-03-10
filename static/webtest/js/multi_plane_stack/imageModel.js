

// Backbone model
// ------------------------------
var ImageModel = Backbone.Model.extend({

    defaults: {
        selectedChannelIdx: 0,
        theZ: 0,
        theT: 0,
        zoom: 100,
    },

    setChannelActive: function(idx, active) {
        var oldChs = this.get('channels');
        // Need to clone the list of channels...
        var chs = [];
        for (var i=0; i<oldChs.length; i++) {
            chs.push($.extend(true, {}, oldChs[i]));
        }
        // ... then toggle active ...
        chs[idx].active = active;
        // ... so that we get the changed event triggering OK
        this.set('channels', chs);
    },

    loadImage: function(imgId) {
        getJSON(WEBGATEWAY + "imgData/" + imgId + "/", function(data){

            data.theT = data.rdefs.defaultT;
            data.theZ = data.rdefs.defaultZ;
            data.sizeX = data.size.width;
            data.sizeY = data.size.height;
            data.sizeT = data.size.t;
            data.sizeZ = data.size.z;
            data.sizeC = data.size.c;
            var chs = [];
            for (var i=0; i<data.channels.length; i++) {
                chs.push(_.extend({}, data.channels[i]));
            }
            data.loadedChannels = chs;
            this.set(data);
        }.bind(this));
    },

    isRGBImage: function() {
        // returns True if the all currently *active* channels are 'unmixed'
        // (are either red, green or blue) and not 2 same color
        var rgb = ['FF0000', '00FF00', '0000FF'];
        // rgbColors is list of colors or False if not rgb.
        var rgbColors = this.get('channels').reduce(function(prev, ch, i){
            console.log(prev, ch, i);
            if (!prev || !ch.active) return prev;
            if (prev.indexOf(ch.color) > -1) return false;
            if (rgb.indexOf(ch.color) === -1) return false;
            prev.push(ch.color);
            return prev;
        }, []);
        console.log('rgbColors', rgbColors);
        // cast list of colors (or false) to boolean
        return !!rgbColors;
    },

    refreshImage: function() {

        // replace 'loadedChannels' with 'channels' 
        var chs = this.get('channels').map(function(ch){
            return _.extend({}, ch);
        });
        this.set('loadedChannels', chs);
        this.trigger('refreshImage');
    },

    getQueryString: function() {
        var cStrings = model.get('channels').map(function(c, i){
            return 1+i + "|" + c.window.start + ":" + c.window.end + "$" + c.color;
        });
        return cStrings.join(",");
    },

    setChannelStart: function(idx, start) {
        this.setChannelWindow(idx, start);
    },

    setChannelEnd: function(idx, end) {
        this.setChannelWindow(idx, undefined, end);
    },

    setChannelWindow: function(idx, start, end) {
        console.log('setChannelWindow', start, end);
        if (!this.isRGBImage()) return;

        var oldChs = this.get('channels');
        // Need to clone the list of channels...
        var chs = [];
        for (var i=0; i<oldChs.length; i++) {
            chs.push($.extend(true, {}, oldChs[i]));
        }
        // ... then set new value ...
        if (start !== undefined) {
            chs[idx].window.start = parseInt(start, 10);
        }
        if (end !== undefined) {
            chs[idx].window.end = end;
        }
        // ... so that we get the changed event triggering OK
        console.log('setChannelWindow', chs);
        this.set('channels', chs);
    }
});