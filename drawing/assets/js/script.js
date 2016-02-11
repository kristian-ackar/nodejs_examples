var single = {
    _url : "http://localhost:8080",
    _doc : null,
    _canvas : null,
    _ctx : null,
    _clients : {},
    _cursors : {},
    _drawing : false,
    _colors : [
        '#CC0000',
        '#00FF00',
        '#FF00FF',
        '#C0C0C0',
        '#00FFFF',
        '#FFFF00'
    ],
    _prev : {},
    _myColor : null,
    _id : null,
    _lastEmit : $.now(),

    init : function() {
        single._doc = $(document);
        single._canvas = $('#paper');
        single._ctx = single._canvas[0].getContext("2d");

        single._myColor = single.getMyColor();

        single._id = single.getRandomId();

        single.initEventHandlers();

        // Remove inactive clients after 10 seconds of inactivity
        setInterval(function() {

            for (ident in single._clients) {
                if ($.now() - single._clients[ident].updated > 10000) {

                    // Last update was more than 10 seconds ago.
                    // This user has probably closed the page
                    single._cursors[ident].remove();
                    delete single._clients[ident];
                    delete single._cursors[ident];
                }
            }

        }, 10000);
    },

    getMyColor : function() {
        var colorIdx = Math.floor(Math.random() * single._colors.length);
        return single._colors[colorIdx];
    },

    getRandomId : function() {
        return Math.round($.now() * Math.random());
    },

    drawLine : function(ctx, fromx, fromy, tox, toy, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;

        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    },
    
    initEventHandlers : function() {
        var socket = io.connect(single._url);

        socket.on("moving", function (data) {

            if (! (data.id in single._clients)) {
                // a new user has come online. create a cursor for them
                single._cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
            }

            // Move the mouse pointer
            single._cursors[data.id].css({
                'left' : data.x,
                'top' : data.y
            });

            // Is the user drawing?
            if (data.drawing && single._clients[data.id]) {

                // Draw a line on the canvas. clients[data.id] holds
                // the previous position of this user's mouse pointer

                single.drawLine(single._ctx, single._clients[data.id].x, single._clients[data.id].y, data.x, data.y, data.color);
            }

            // Saving the current client state
            single._clients[data.id] = data;
            single._clients[data.id].updated = $.now();
        });

        single._canvas.on("mousedown", function(e) {
            e.preventDefault();
            single._drawing = true;
            single._prev.x = e.pageX;
            single._prev.y = e.pageY;
        });

        single._doc.bind("mouseup mouseleave", function() {
            single._drawing = false;
        });

        single._doc.on("mousemove", function(e) {
            if ($.now() - single._lastEmit > 30) {
                socket.emit('mousemove', {
                    'x': e.pageX,
                    'y': e.pageY,
                    'drawing': single._drawing,
                    'id': single._id,
                    'color': single._myColor
                });
8
                single._lastEmit = $.now();
            }

            // Draw a line for the current user's movement, as it is
            // not received in the socket.on('moving') event above

            if (single._drawing) {

                single.drawLine(single._ctx, single._prev.x, single._prev.y, e.pageX, e.pageY, single._myColor);

                single._prev.x = e.pageX;
                single._prev.y = e.pageY;
            }
        });
    }
};

$(document).ready(function() {
    single.init();
});
