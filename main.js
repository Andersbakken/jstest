
function Rect(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

Rect.prototype.intersects = function(other)
{
    if (this.x <= other.x + other.w && this.x + this.w >= other.x && this.y <= other.y + other.h && this.y + this.h >= other.y) {
        var xx = this.x < other.x ? other.x : this.x;
        var yy = this.y < other.y ? other.y : this.y;

        return new Rect(xx,
                        yy,
                        (this.x + this.w < other.x + other.w ? this.x + this.w : other.x + other.w) - xx,
                        (this.y + this.h < other.y + other.h ? this.y + this.h : other.y + other.h) - yy);
    }
    return undefined;
};


var nodeCount = 0;

function Node(x, y, w, h)
{
    this.rect = new Rect(x, y, w, h);
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
    var r = clip.intersects(this.rect);
    if (r) {
        ++ret;
        var l = this.children ? this.children.length : 0;
        for (var i=0; i<l; ++i) {
            ret += this.children[i].render(r);
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

function run(count)
{
    var start = mono();
    var root = new Node(0, 0, 1280, 720);
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
