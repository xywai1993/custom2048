import './style.css';
import tool from './tool';

interface DataArr {
    num: number | '';
    row: number;
    col: number;
}

const ROW = 4; // 行
const COL = 4; // 列
let space: number = 20; //方块间隔
let boxWidth: number = 0; // 方块宽度
const canvas = <HTMLCanvasElement>document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const dataArray: DataArr[] = [];

// 创建4*4格子
const createBox = (row: number, col: number) => {
    ctx.fillStyle = '#999';
    tool.createArray(row).forEach(i => {
        tool.createArray(col).forEach(k => {
            const postion = getPosition(i, k);
            ctx.fillRect(postion.left, postion.top, boxWidth, boxWidth);
        });
    });
};

//创建数字
const createNum = (num: number | '', row: number, col: number) => {
    const postion = getPosition(row, col);
    ctx.fillStyle = '#fff';
    ctx.font = '48px serif';
    const space = boxWidth / 2;
    ctx.fillText(String(num), postion.left + space - 11, postion.top + space + 15);
    dataArray[row * ROW + col].num = num;
};

const getPosition = (row: number, col: number) => {
    return {
        top: row * boxWidth + (row + 1) * space,
        left: col * boxWidth + (col + 1) * space
    };
};

// 动态设置canvas宽高
const setCanvasWH = () => {
    const w = document.documentElement.offsetWidth;
    console.log(w);
    boxWidth = Math.ceil((w - space * (COL + 1)) / COL);
    space = Math.floor((w - boxWidth * COL) / 5);
    console.log(boxWidth, space);
    canvas.width = w - 2;
    canvas.height = w - 2;
};

// 游戏数据表
const createDataArr = (row: number, col: number) => {
    tool.createArray(row).forEach(i => {
        tool.createArray(col).forEach(k => {
            dataArray.push({
                num: '',
                row: i,
                col: k
            });
        });
    });
};

//随机数字 并生成
const randowNum = () => {
    const arr = dataArray.filter((item, i) => {
        return !item.num;
    });
    console.log(arr);

    if (arr.length <= 0) {
        return;
    }
    const randow = Math.floor(Math.random() * arr.length);
    const data = arr[randow];
    const num = Math.floor(Math.random() * 100) > 50 ? 2 : 4;
    createNum(num, data.row, data.col);
};

// 判断是否游戏结束
const isGameOver = () => {
    let gameOver = true;

    const arr = dataArray.filter((item, i) => {
        return !item.num;
    });

    //判断上下左右是否有可以合并的项
    for (let i = 0; i < dataArray.length; i++) {
        const item = dataArray[i];
        const up = item.row === 0 ? null : dataArray[i - COL].num;
        const down = item.row === 3 ? null : dataArray[i + COL].num;
        const left = item.col === 0 ? null : dataArray[i - 1].num;
        const right = item.col === 3 ? null : dataArray[i + 1].num;

        const num = item.num;
        if (num === up || num === down || num === left || num === right) {
            gameOver = false;
            break;
        }
    }
    return arr.length === 0 && gameOver;
};

const goLeft = () => {
    //分组  [0,1,2,3]  [4,5,6,7] [8,9,10,11] [12,13,14,15]
    const createGroup = () => {
        const arr: DataArr[][] = [];
        tool.createArray(ROW).map(i => {
            const data = tool.deepClone(dataArray);
            arr.push(data.slice(i * ROW, (i + 1) * ROW));
        });
        console.log(tool.deepClone(arr));

        return arr;
    };

    // 空位往前补
    const replaceSpace = () => {
        let arr = createGroup();
        arr.map(item => {
            let zero = 0; //空位数量
            item.map((it, i) => {
                if (it.num) {
                    const index = it.row * ROW + it.col;
                    if (zero) {
                        dataArray[index - zero].num = tool.deepClone(it.num);
                        dataArray[index].num = '';
                    }
                } else {
                    zero++;
                }
            });
        });
    };

    replaceSpace();
    console.log(tool.deepClone(dataArray));

    let arr = createGroup();
    // 前后相等的2项相加
    arr.map(item => {
        item.map((it, i) => {
            if (it.num) {
                const index = it.row * ROW + it.col;
                const nextItem = item[i + 1] ? item[i + 1] : null;
                //满足三个条件即可两项相加 nextItem 是否存在后一项
                // data.num === nextItem.num  前后相等
                //dataArray[index].num === it.num  表示还没被相加  避免出现 【 2，2，2，0】 相加后出现 【4，4，0，0】的情况
                if (nextItem && it.num === nextItem.num && dataArray[index].num === it.num) {
                    dataArray[index].num = it.num * 2;
                    dataArray[index + 1].num = '';
                }
            }
        });
    });

    replaceSpace();

    console.log(dataArray);
};

const goRight = () => {
    //分组  [0,1,2,3]  [4,5,6,7] [8,9,10,11] [12,13,14,15]
    const createGroup = () => {
        const arr: DataArr[][] = [];
        tool.createArray(ROW).map(i => {
            const data = tool.deepClone(dataArray);
            arr.push(data.slice(i * ROW, (i + 1) * ROW));
        });
        console.log(tool.deepClone(arr));

        return arr;
    };

    const replaceSpace = () => {
        // 空位往前补
        let arr = createGroup();
        arr.map(item => {
            let zero = 0; //空位数量
            item.map((it, i) => {
                const data = item[COL - i - 1];
                if (data.num) {
                    const index = data.row * ROW + data.col;
                    if (zero) {
                        dataArray[index + zero].num = tool.deepClone(data.num);
                        dataArray[index].num = '';
                    }
                } else {
                    zero++;
                }
            });
        });
    };

    replaceSpace();

    let arr = createGroup();
    // 前后相等的2项相加
    arr.map(item => {
        item.map((it, i) => {
            const data = item[COL - i - 1];
            if (data.num) {
                const index = data.row * ROW + data.col;
                const nextItem = item[COL - i - 2] ? item[COL - i - 2] : null;

                if (nextItem && data.num === nextItem.num && dataArray[index].num === data.num) {
                    dataArray[index].num = data.num * 2;
                    dataArray[index - 1].num = '';
                }
            }
        });
    });

    replaceSpace();

    // console.log(dataArray);
};

const goUp = () => {
    //分组  [0,1,2,3]  [4,5,6,7] [8,9,10,11] [12,13,14,15]
    const createGroup = () => {
        const arr: DataArr[][] = [];
        const data: DataArr[] = tool.deepClone(dataArray);
        data.map((item, i) => {
            arr[item.col] = arr[item.col] ? arr[item.col] : [];

            arr[item.col][item.row] = item;
        });
        console.log(arr);

        return arr;
    };

    const replaceSpace = () => {
        let arr = createGroup();
        arr.map(item => {
            let zero = 0; //空位数量
            item.map((it, i) => {
                if (it.num) {
                    const index = it.row * ROW + it.col;
                    if (zero) {
                        dataArray[index - zero * ROW].num = tool.deepClone(it.num);
                        dataArray[index].num = '';
                    }
                } else {
                    zero++;
                }
            });
        });
    };

    replaceSpace();

    let arr = createGroup();
    // 前后相等的2项相加
    arr.map(item => {
        item.map((it, i) => {
            if (it.num) {
                const index = it.row * ROW + it.col;
                const nextItem = item[i + 1] ? item[i + 1] : null;
                //满足三个条件即可两项相加 nextItem 是否存在后一项
                // data.num === nextItem.num  前后相等
                //dataArray[index].num === it.num  表示还没被相加  避免出现 【 2，2，2，0】 相加后出现 【4，4，0，0】的情况
                if (nextItem && it.num === nextItem.num && dataArray[index].num === it.num) {
                    dataArray[index].num = it.num * 2;
                    dataArray[index + ROW].num = '';
                }
            }
        });
    });
    replaceSpace();

    // console.log(dataArray);
};

const goDown = () => {
    //分组  [0,1,2,3]  [4,5,6,7] [8,9,10,11] [12,13,14,15]
    const createGroup = () => {
        const arr: DataArr[][] = [];
        const data: DataArr[] = tool.deepClone(dataArray);
        data.map(item => {
            arr[item.col] = arr[item.col] ? arr[item.col] : [];

            arr[item.col][item.row] = item;
        });
        console.log(arr);

        return arr;
    };

    const replaceSpace = () => {
        let arr = createGroup();
        arr.map(item => {
            let zero = 0; //空位数量
            item.map((it, i) => {
                const data = item[ROW - i - 1];
                if (data.num) {
                    const index = data.row * ROW + data.col;
                    if (zero) {
                        dataArray[index + zero * ROW].num = tool.deepClone(data.num);
                        dataArray[index].num = '';
                    }
                } else {
                    zero++;
                }
            });
        });
    };

    replaceSpace();

    let arr = createGroup();
    // 前后相等的2项相加
    arr.map(item => {
        item.map((it, i) => {
            const data = item[ROW - i - 1];
            if (data.num) {
                const index = data.row * ROW + data.col;
                const nextItem = item[ROW - i - 2] ? item[ROW - i - 2] : null;
                //满足三个条件即可两项相加 nextItem 是否存在后一项
                // data.num === nextItem.num  前后相等
                //dataArray[index].num === it.num  表示还没被相加  避免出现 【 2，2，2，0】 相加后出现 【4，4，0，0】的情况
                if (nextItem && data.num === nextItem.num && dataArray[index].num === data.num) {
                    dataArray[index].num = data.num * 2;
                    dataArray[index - ROW].num = '';
                }
            }
        });
    });
    replaceSpace();

    // console.log(dataArray);
};

//根据数据表重绘
const drawCanvas = () => {
    //判断是否游戏结束
    if (isGameOver()) {
        alert('你死了');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createBox(ROW, COL);
    dataArray.map(item => {
        if (item.num) {
            createNum(item.num, item.row, item.col);
        }
    });

    randowNum();
};

createDataArr(ROW, COL);
setCanvasWH();
createBox(ROW, COL);
randowNum();
randowNum();

// 滑动监听
tool.touchDirection(canvas, dir => {
    console.log(dir);
    if (dir.isTouch) {
        switch (dir.dir) {
            case 'left':
                goLeft();
                break;
            case 'right':
                goRight();
                break;
            case 'top':
                goUp();
                break;
            case 'bottom':
                goDown();
                break;
            default:
                break;
        }
        drawCanvas();
    }
});

const KEYDOWN = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};
document.addEventListener('keydown', e => {
    switch (e.keyCode) {
        case KEYDOWN.UP:
            goUp();
            break;
        case KEYDOWN.RIGHT:
            goRight();
            break;
        case KEYDOWN.DOWN:
            goDown();
            break;
        case KEYDOWN.LEFT:
            goLeft();
            break;
    }
    drawCanvas();
});

document.addEventListener('touchmove', e => {
    e.preventDefault();
});
document.addEventListener('touchend', e => {
    e.preventDefault();
});
