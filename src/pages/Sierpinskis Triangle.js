import { useRef, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useForceUpdate } from "../helpers/forceupdate";
const TRIANGLE_PADDING = 5;

const TRIANGLE_LEFT = 0;
const TRIANGLE_CENTER = 1;
const TRIANGLE_RIGHT = 2;

const ReferenceResolution = {width: 350, height: 350}; 

const Triangle = () => {
    const canvasRef = useRef();
    const ctxRef = useRef();
    const isPlayingRef = useRef();
    const speedRef = useRef();
    const shouldDrawLinesRef = useRef();
    const pixelSizeRef = useRef(window.innerWidth < 450 ? 1:3);
    const [playing, setPlaying] = useState(false);
    const [drawLines, setDrawLines] = useState(false);
    const [pixelSize, setPixelSize] = useState(window.innerWidth < 450 ? 1:3);
    const [initialPoint, setInitialPoint] = useState(null)
    const [speed, setSpeed] = useState(1);
    const forceUpdate = useForceUpdate();

    const iterationCountRef = useRef(0);
    const trianglePoints = useRef();

    const lastSelected = useRef(TRIANGLE_CENTER);
    const lastPoint = useRef();

    const intervalRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current != null)
            setupTriangle();
    },[canvasRef])

    useEffect(() => {
        isPlayingRef.current = playing;
        if (playing) {
            drawTriangle(false);
            const id = setInterval(() => forceUpdate(), 200);
            intervalRef.current = id;
        }
        else if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null;
        }
    }, [playing])

    useEffect(() => {
        speedRef.current = speed;
    }, [speed])

    useEffect(() => {
        shouldDrawLinesRef.current = drawLines;
    }, [drawLines]);

    useEffect(() => {
        pixelSizeRef.current = pixelSize;
    }, [pixelSize])

    useEffect(() => {
        if (!playing && initialPoint?.x && initialPoint?.y) {
            lastPoint.current = {x: initialPoint.x, y: initialPoint.y};
            setupTriangle();
        }
    }, [initialPoint])

    const setupTriangle = () => {
        const canvas = canvasRef.current;
        ctxRef.current = canvas.getContext("2d");
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

        const isMobile = window.innerWidth < 450;

        canvas.width = isMobile ? window.innerWidth : window.innerWidth/2;
        canvas.height = isMobile ? window.innerWidth :window.innerWidth/2;

        canvas.style = `width: ${isMobile ? window.innerWidth : window.innerWidth/2}px; height: ${isMobile ? window.innerWidth : window.innerWidth/2}px;`

        const centerPointX = canvas.width/2,
        centerPointY = TRIANGLE_PADDING

        const leftPointX = 0 + TRIANGLE_PADDING,
        leftPointY = canvas.height - TRIANGLE_PADDING;

        const rightPointX = canvas.width - TRIANGLE_PADDING,
        rightPointY = canvas.height - TRIANGLE_PADDING;

        let initialPointX = centerPointX,
        initialPointY = canvas.height/2;

        if (initialPoint?.x ) {
            initialPointX = initialPoint.x;
        }

        if (initialPoint?.y) {
            initialPointY = initialPoint.y;
        }

        trianglePoints.current = [
            {x: leftPointX, y: leftPointY},
            {x: centerPointX, y: centerPointY},
            {x: rightPointX, y: rightPointY},
        ]

        lastPoint.current = {x: initialPointX, y: initialPointY};

        drawPixel(lastPoint.current.x, lastPoint.current.y, ctxRef.current, "red");
        drawPixel(leftPointX, leftPointY, ctxRef.current);
        drawPixel(rightPointX, rightPointY, ctxRef.current);
        drawPixel(centerPointX, centerPointY, ctxRef.current);

        iterationCountRef.current = 0;
    }
    const drawTriangle = (oneStep) => {
        iterationCountRef.current++;
        const ctx = ctxRef.current;
        randomlySelectPoint();

        const triX = trianglePoints.current[lastSelected.current].x,
        triY = trianglePoints.current[lastSelected.current].y

        const x = lastPoint.current.x,
        y = lastPoint.current.y;

        const midPointX = (x + triX)/2,
        midPointY = (y + triY)/2;

        if (shouldDrawLinesRef.current) {
            ctx.moveTo(x, y);
            ctx.lineTo(midPointX, midPointY);
            ctx.stroke();
        }
        else
            drawPixel(midPointX, midPointY, ctx)

        lastPoint.current = {x: midPointX, y: midPointY}

        if (isPlayingRef.current && !oneStep) {
            setTimeout(() => {
                requestAnimationFrame(() => drawTriangle(false));
            }, (400 / speedRef.current) - 1)
        }
            
    }
    const randomlySelectPoint = () => {
        const selected = getRandomInt(0, 2);
        lastSelected.current = selected;
    }
    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const drawPixel = (x, y, ctx, color) => {
        var roundedX = Math.round(x);
        var roundedY = Math.round(y);
        ctx.fillStyle = color || "black";
        ctx.fillRect(roundedX, roundedY, pixelSizeRef.current, pixelSizeRef.current);
    }
    
    const controls = () => (
        <div style={{margin:10}}>
        <div>
            <p style={{margin:0}}>Iteration Speed</p>
            <div style={{display:"flex"}}>
                <input type="range" min="1" max="400" value={speed} onChange={(e) => setSpeed(e.target.value)}/>
                <p style={{margin:5}}>{speed}</p>
            </div>
        </div>

        <div>
            <p style={{margin:0}}>Pixel Size</p>
            <div style={{display:"flex"}}>
                <input type="range" min="1" max="5" value={pixelSize} onChange={(e) => setPixelSize(e.target.value)}/>
                <p style={{margin:5}}>{pixelSize}</p>
            </div>
        </div>

        <div style={{display:"flex", alignItems:"center", margin:"10px 10px 10px 0"}}>
            <p style={{margin:0}}>Draw lines between dots</p>
            <input type={"checkbox"} style={{marginLeft:15}} value={drawLines} onChange={(e) => setDrawLines(!drawLines)}/>

        </div>
        
        <Button style={{margin:"2px 2px 2px 0"}} variant={playing ? "danger" : "outline-dark"} onClick={() => setPlaying(!playing)}>
            {playing ? "Stop" : "Start"}
        </Button>
        <Button style={{margin:"2px 2px 2px 0"}} variant={"outline-success"} disabled={playing} onClick={() => {drawTriangle(true); forceUpdate()}}>
            Step Once
        </Button>
        <Button style={{margin:"2px 2px 2px 0"}} variant={"danger"} disabled={playing} onClick={() => {setupTriangle(); forceUpdate()}}>
            Restart
        </Button>
    </div>
    )
    return (
        <div style={{display:"flex", height:"100%", flexDirection: window.innerWidth < 450 ? "column":"row", overflow:"auto"}}>
            <div style={{ display:"flex", flex:1, padding:5}}> 
                <canvas ref={canvasRef} onMouseDown={(e) => {setInitialPoint({x: e.clientX, y: e.clientY}); console.log(e)}}/>
            </div>
            <div style={{display:"flex", flex:1, flexDirection:"column",padding:5}}>
            {window.innerWidth <=    450 &&
                     controls()}
                <h1 style={{margin:"10px 10px 10px 0"}}>
                    Sierpinskis Triangle
                </h1>
                <p>Iteration Count : {iterationCountRef.current}</p>

                <div>
                    <p style={{margin:5}}>Fractal rules: </p>
                    <p style={{margin:5}}>- Start with 3 points arranged in a triangle formation </p>
                    <p style={{margin:5}}>- Select a spot within the triangle</p>
                    <p style={{margin:5}}>- Upon hitting start, one of the triangle points will be randomly selected<br/>
                    a point will be placed between the randomly selected triangle point and the point you selected</p>
                    <p style={{margin:5}}>- One of the triangle points will be randomly selected again, and a mid point <br/>
                    will be placed between that point and the last mid point, <span style={{fontWeight:"bold"}}>This will be repeated forever!</span></p>
                    <p style={{margin:5, fontWeight:"bold", fontStyle:"italic"}}>Its really easy to follow this by stepping through it with lines on(although you wont see the fractal with lines on) </p>
                </div>
                {window.innerWidth > 450 &&
                     controls()}
            </div>

        </div>
    )
}

export default Triangle;