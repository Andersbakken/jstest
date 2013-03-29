
function Rect(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function intersects(l, r)
{
    var x = l[0];
    var y = l[1];
    var x2 = x + l[2];
    var y2 = y + l[3];
    var ox = r[0];
    var oy = r[1];
    var ox2 = ox + r[2];
    var oy2 = oy + r[3];

    if (x <= ox2 && x2 >= ox && y <= oy2 && y2 >= oy) {
        var xx = x < ox ? ox : x;
        var yy = y < oy ? oy : y;

        return [xx, yy, (x2 < ox2 ? x2 : ox2) - xx, (y2 < oy2 ? y2 : oy2) - yy];
    }
}


var nodeCount = 0;

function Node(x, y, w, h)
{
    this.rect = [x, y, w, h];
    ++nodeCount;
}

Node.prototype.addChild = function(child)
{
    if (this.children) {
        this.children.push(child);
    } else {
        this.children = [child];
    }
};

Node.prototype.render = function(clip)
{
    var ret = 0;
    var r = intersects(this.rect, clip);
    if (r) {
        ++ret;
        var c = this.children;
        var l = c ? c.length : 0;
        for (var i=0; i<l; ++i) {
            ret += c[i].render(r);
        }
    }
    return ret;
};

var numbers = [100, 400, 230, 120, 141, 400, 20, 1300, 450, 350 ];
var index = 0;

function num()
{
    return numbers[index++ % numbers.length];
}

function mono()
{
    return new Date().valueOf();
}

function generate(parent, count, depth)
{
    for (var i=0; i<count; ++i) {
        var c = new Node(num() % 1280, num() % 720, (num() % 1000) + 100, (num() % 1000) + 100);
        parent.addChild(c);
        if (depth)
            generate(c, count, depth - 1);
    }
}

var root;

function run(count)
{
    // debugger;
    nodeCount = 0;
    index = 0;
    var start = mono();
    root = new Node(0, 0, 1280, 720);
    generate(root, 10, 4);
    var elapsed = mono() - start;
    console.log("Created " + nodeCount + " " + elapsed + "ms");
    start = mono();
    var rendered = 0;
    for (var i=0; i<count; ++i) {
        rendered += root.render(root.rect);
    }
    elapsed = mono() - start;
    console.log("Rendered " + rendered + " " + elapsed + "ms");
}
