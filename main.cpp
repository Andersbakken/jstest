#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <algorithm>

struct Rect
{
    Rect(int xx = 0, int yy = 0, int ww = 0, int hh = 0)
        : x(xx), y(yy), w(ww), h(hh)
    {}

    int x, y, w, h;

    inline bool intersects(const Rect &other, Rect *intersection) const
    {
        if (x <= other.x + other.w && x + w >= other.x && y <= other.y + other.h && y + h >= other.y) {
            if (intersection) {
                intersection->x = std::max(x, other.x);
                intersection->y = std::max(y, other.y);
                intersection->w = std::min(x + w, other.x + other.w) - intersection->x;
                intersection->h = std::min(y + h, other.y + other.h) - intersection->y;
            }
            return true;
        }

        if (intersection)
            *intersection = Rect();
        return false;
    }
};

int nodeCount = 0;
struct Node
{
    Node()
        : firstChild(0), next(0)
    {
        ++nodeCount;
    }

    int render(const Rect &clipRect);

    Node *firstChild, *next;
    Rect rect;
};

const int numbers[] = { 100, 400, 230, 120, 141, 400, 20, 1300, 450, 350 };
int index = 0;
inline int num()
{
    return numbers[index++ % sizeof(numbers) / sizeof(int)];
}

int Node::render(const Rect &clip)
{
    int ret = 0;
    Rect r;
    if (clip.intersects(rect, &r)) {
        // printf("Intersecting %d %d %d %d with %d %d %d %d => %d %d %d %d\n",
        //        clip.x, clip.y, clip.w, clip.h,
        //        rect.x, rect.y, rect.w, rect.h,
        //        r.x, r.y, r.w, r.h);
        ++ret;
        Node *n = firstChild;
        while (n) {
            ret += n->render(r);
            n = n->next;
        }
    // } else {
    //     printf("Not intersecting %d %d %d %d with %d %d %d %d\n",
    //            clip.x, clip.y, clip.w, clip.h,
    //            rect.x, rect.y, rect.w, rect.h);
    }
    return ret;
}

static inline uint64_t mono()
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (ts.tv_sec * 1000) + (ts.tv_nsec / 1000000);
}

void generate(Node *node, int count, int depth)
{
    for (int i=0; i<count; ++i) {
        Node *n = new Node;
        n->rect.x = num() % 1280;
        n->rect.y = num() % 720;
        n->rect.w = (num() % 1000) + 100;
        n->rect.h = (num() % 1000) + 100;
        if (!node->firstChild) {
            node->firstChild = n;
        } else {
            Node *tmp = node->firstChild;
            while (tmp->next)
                tmp = tmp->next;
            tmp->next = n;
        }
        if (depth)
            generate(n, count, depth - 1);
    }
}

int main(int argc, char **argv)
{
    uint64_t start = mono();
    Node root;
    root.rect.w = 1280;
    root.rect.h = 720;

    int count = (argc > 1 ? atoi(argv[1]) : 0);
    if (!count)
        count = 5000;
    generate(&root, 10, 4);
    uint64_t elapsed = mono() - start;
    printf("Created %d nodes in %lldms\n", nodeCount, elapsed);
    start = mono();
    int rendered = 0;
    for (int i=0; i<count; ++i) {
        rendered += root.render(root.rect);
    }
    elapsed = mono() - start;
    printf("Rendered %d nodes in %lldms\n", rendered, elapsed);

    return 0;
}
