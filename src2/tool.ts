interface Dir {
    dir: string;
    isTouch: boolean;
}

const tool = {
    deepClone(obj: object) {
        return JSON.parse(JSON.stringify(obj));
    },
    createArray(num: number) {
        return Array.from({ length: num }).map((item, i) => {
            return i;
        });
    },
    touchDirection: (element: Node, callback: Function, num: number = 30) => {
        let startX = 0,
            startY = 0,
            endX = 0,
            endY = 0;
        let dir: Dir = { dir: '', isTouch: false };
        const oNum = num;
        element.addEventListener(
            'touchstart',
            function(event) {
                dir.isTouch = false;
                //event.preventDefault();
                var touch = event.targetTouches[0];
                startX = touch.pageX;
                startY = touch.pageY;
            },
            false
        );

        element.addEventListener(
            'touchmove',
            function(event) {
                dir.isTouch = true;
                //event.preventDefault();
                var touch = event.targetTouches[0];
                endX = touch.pageX;
                endY = touch.pageY;
                // console.log(startX,startY)
            },
            false
        );

        element.addEventListener(
            'touchend',
            function() {
                //event.preventDefault();
                const touchX = endX - startX,
                    touchY = endY - startY;

                if (Math.abs(touchX) > Math.abs(touchY)) {
                    if (touchX < -oNum) {
                        // console.log('向左')
                        dir.dir = 'left';
                    } else if (touchX > oNum) {
                        // console.log('向右')
                        dir.dir = 'right';
                    }
                } else {
                    if (touchY < -oNum) {
                        // console.log('向上');
                        dir.dir = 'top';
                    }
                    if (touchY > oNum) {
                        // console.log('向下') ;
                        dir.dir = 'bottom';
                    }
                }
                callback(dir);
            },
            false
        );
        // return dir;
    }
};
export default tool;
