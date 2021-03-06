app.directive('n1bTimer', function(Minions) {
    return {
        restrict: 'A',
        scope: {
            startDate: '='
        },
        link: function(scope, element, attrs) {
            var date = new Date(scope.startDate);
            createTimer(element[0], date);

            function toMinutes(millis){
                return Math.floor(millis/(1000*60))
            }

            function createTimer(element,start){
                var paper = Raphael(element, '100%', '100%');
                //---- calculate dimensions and size
                var width = paper.canvas.offsetHeight;
                var height= paper.canvas.offsetWidth;
                var side = Math.min(width,height);
                var R = side*3.0/8.0;
                var center = side/2;
                var archWidth = side/15.0;
                var fontSize = side/5;
                var markRadius = side/150;
                var init = true,
                    param = {stroke: "#fff", "stroke-width": archWidth},
                    marksAttr = {fill: "#fff", stroke: "none",r:markRadius}, textAttr =
                    {fill: "#FFF",'font-size':fontSize,'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif'}


                //---- Custom Attribute
                paper.customAttributes.arc = function (value, total, R) {
                    var alpha = 360 / total * value,
                        a = (90 - alpha) * Math.PI / 180;
                    var x = center + R * Math.cos(a);
                    var y = center - R * Math.sin(a);
                    var color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)");
                    var path;
                    if (total == value) {
                        path = [["M", center, center - R], ["A", R, R, 0, 1, 1,center - 0.01, center -
                        R]];
                    } else {
                        path = [["M", center, center - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
                    }
                    return {path: path, stroke: color};
                };

                //--- draw components
                drawMarks(R, 60);
                var sec = paper.path().attr(param).attr({arc: [0, 60, R]});
                var text = paper.text(center, center, "").attr(textAttr);

                function updateVal(value, total, R, hand) {
                    if (init) {
                        hand.animate({arc: [value, total, R]}, 900, ">");
                    } else {
                        if (!value || value == total) {
                            value = total;
                            hand.animate({arc: [value, total, R]}, 750, "bounce", function () {
                                hand.attr({arc: [0, total, R]});
                            });
                        } else {
                            hand.animate({arc: [value, total, R]}, 750, "elastic");
                        }
                    }
                }

                function drawMarks(R, total) {
                    var out = paper.set();
                    for (var value = 0; value < total; value++) {
                        var alpha = 360 / total * value,
                            a = (90 - alpha) * Math.PI / 180,
                            x = center + R * Math.cos(a),
                            y = center - R * Math.sin(a);
                        out.push(paper.circle(x, y, 2).attr(marksAttr));
                    }
                    return out;
                }

                //--- start clock
                (function () {
                    var d = new Date((new Date()).getTime() - start.getTime());
                    updateVal(d.getSeconds(), 60, R, sec, 2);

                    text.attr({text: toMinutes(d.getTime()) + 'm'})

                    setTimeout(arguments.callee, 1000);
                    init = false;
                })();
            }
        }
    }
});