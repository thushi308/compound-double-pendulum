let stepsPerFrame = 1;
let time = 0;
let scale = 100

// Trace path history
let path = [];
let running = false;

function G (y) {
    const [t1d, t2d, t1, t2] = y;
    
    let int1=0, int2=0;
    let cos_t1 = Math.cos(t1), cos_t2 = Math.cos(t2), sin_t1 = Math.sin(t1), sin_t2 = Math.sin(t2);
    let Vx_part1 = P.l1*t1d*cos_t1, Vy_part1 = P.l1*t1d*sin_t1;
    let Vx_part2 = t2d*cos_t2, Vy_part2 = t2d*sin_t2;
    let cos_diff = Math.cos(t2-t1), sin_diff = Math.sin(t2-t1);
    for (let s of svals) {
        const Vx=Vx_part1+s*Vx_part2;
        const Vy=Vy_part1+s*Vy_part2;
        const V=Math.hypot(Vx,Vy);
        int1+=V*(Vx*cos_t1+Vy*sin_t1);
        int2+=V*(Vx*cos_t1+Vy*sin_t1);
    }

    const Q1 = -Math.sign(t1d)*(Q.ad1*t1d*t1d + Q.fl1 + Q.fv1*Math.abs(t1d)) - Q.ic1*int1;
    const Q2 = -Math.sign(t2d-t1d)*(Q.fl2 + Q.fv2*Math.abs(t2d-t1d)) - Q.ic2*int2;

    const F1 = Q1 - J.c*sin_diff*t2d*t2d - u.one*sin_t1;
    const F2 = Q2 + J.c*sin_diff*t1d*t1d - u.two*sin_t2;
    
    const det = J.a*J.b - J.c*J.c*cos_diff*cos_diff;
    return [(J.b*F1 - J.c*cos_diff*F2)/det, (-J.c*cos_diff*F1 + J.a*F2)/det, t1d, t2d];
}

function RK4_step (y, dt) {
    const k1 = G(y);
    const k2 = G(y.map((v,i)=>v+0.5*dt*k1[i]));
    const k3 = G(y.map((v,i)=>v+0.5*dt*k2[i]));
    const k4 = G(y.map((v,i)=>v+dt*k3[i]));
    let result = [0, 0, 0, 0];
    result = result.map((v,i)=>dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
    return result;
}

function setup() {
    // Attach canvas to our specific container
    let container = document.getElementById('canvas-container');
    let cnv = createCanvas(container.offsetWidth, container.offsetHeight);
    cnv.parent('canvas-container');
    windowResized();
    rectMode(CORNERS);
    frameRate(30);
    // Initialize Variables based on Inputs
    readParams();
    readInitialValue();
}

function draw() {
    background(75);

    if (running) {
        for (let i = 0; i < Math.round(stepsPerFrame*P.speed); i++) {
            y_step = RK4_step(y, P.dt);
            y = y.map((v,i)=>v+y_step[i]);
            time+=P.dt;
        }
    }
    
    textSize(20);
    fill('white');
    text(time.toFixed(3), width-90, 40);

    translate(width/2, height/4);

    const x1=scale*P.l1*Math.sin(y[2]);
    const y1=scale*P.l1*Math.cos(y[2]);
    const x2=x1+scale*P.l2*Math.sin(y[3]);
    const y2=y1+scale*P.l2*Math.cos(y[3]);

    const x11=0-(scale*P.w1*Math.cos(y[2]) / 2);
    const y11=0+(scale*P.w1*Math.sin(y[2]) / 2);
    const x12=0+(scale*P.w1*Math.cos(y[2]) / 2);
    const y12=0-(scale*P.w1*Math.sin(y[2]) / 2);
    const x13=x1+(scale*P.w1*Math.cos(y[2]) / 2);
    const y13=y1-(scale*P.w1*Math.sin(y[2]) / 2);
    const x14=x1-(scale*P.w1*Math.cos(y[2]) / 2);
    const y14=y1+(scale*P.w1*Math.sin(y[2]) / 2);

    const x21=x1-(scale*P.w2*Math.cos(y[3]) / 2);
    const y21=y1+(scale*P.w2*Math.sin(y[3]) / 2);
    const x22=x1+(scale*P.w2*Math.cos(y[3]) / 2);
    const y22=y1-(scale*P.w2*Math.sin(y[3]) / 2);
    const x23=x2+(scale*P.w2*Math.cos(y[3]) / 2);
    const y23=y2-(scale*P.w2*Math.sin(y[3]) / 2);
    const x24=x2-(scale*P.w2*Math.cos(y[3]) / 2);
    const y24=y2+(scale*P.w2*Math.sin(y[3]) / 2);

    stroke(255);
    strokeWeight(1);
    line(x11,y11,x12,y12);
    line(x12,y12,x13,y13);
    line(x13,y13,x14,y14);
    line(x14,y14,x11,y11);
    strokeWeight(1);
    line(x21,y21,x22,y22);
    line(x22,y22,x23,y23);
    line(x23,y23,x24,y24);
    line(x24,y24,x21,y21);
    
    noStroke();
    fill(200);
    ellipse(0,0,12,12);
    ellipse(x1,y1,12,12);
    
    // Optional: Draw Path
    if (running) {
        path.push({x: x2, y: y2});
        if (path.length > 200) path.shift(); // Keep path short
    }
    
    noFill();
    stroke(255, 64, 129, 100);
    strokeWeight(1);
    beginShape();
    for (let p of path) {
        vertex(p.x, p.y);
    }
    endShape();
}

let P, y, svals, J, u, Q;

function readParams() {
    const g = id => parseFloat(document.getElementById(id).value);
    P = {
        m1:g("m1"), m2:g("m2"), l1:g("l1"), l2:g("l2"),
        w1:g("w1"), w2:g("w2"), CD1:g("CD1"), CD2:g("CD2"),
        lc1:g("l1")/2, lc2:g("l2")/2,
        I1:(g("m1")*(g("w1")**2)/16)+(g("m1")*(g("l1")**2)/3), I2:(g("m2")*(g("w2")**2)/16)+(g("m2")*(g("l2")**2)/3),

        BM1:g("BM1"), BM2:g("BM2"),
        BOR1:g("BOR1"), BOR2:g("BOR2"), BOR1:g("BIR1"), BOR2:g("BIR2"),
        BR1:g("BOR1")+g("BIR1") / 2, BR2:g("BOR2")+g("BIR2") / 2,
        BD1:g("BOR1")+g("BIR1"), BD2:g("BOR2")+g("BIR2"),
        BI1:g("BM1")*(g("BOR1")**2) / 2, BI2:g("BM2")*(g("BOR2")**2) / 2,
        f1:g("f1"), f2:g("f2"), k1:g("k1"), k2:g("k2"),
        n1:g("n1"), n2:g("n2"),

        g:g("g"), p:g("p"), ds:g("ds"), dt:g("dt"),
        
        speed:g("speed")
    };
    svals = [];
    for (let s=0; s<=P.l2; s+=P.ds) svals.push(s);
    J = {
        a:P.m1*(P.lc1**2)+P.m2*(P.l1**2)+P.I1+P.BI1,
        b:P.m2*(P.lc2**2)+P.I2+P.BI2,
        c:P.m2*P.l1*P.lc2
    };
    u = {
        one:P.m1*P.lc1*P.g + P.m2*P.l1*P.g,
        two:P.m2*P.lc2*P.g
    };
    Q = {
        ad1:P.CD1*P.p*P.w1*(P.l1**4) / 8, fl1:P.f1*(P.m1+P.m2+P.BM2)*P.BR1,
        fv1:P.k1*P.n1*(P.BD1**3), ic1:P.p*P.l1*P.CD2*P.w2*P.ds / 2,

        fl2:P.f2*P.m2*P.BR2, fv2:P.k2*P.n2*(P.BD2**3), ic2:P.p*P.CD2*P.w2*P.ds / 2
    };
    path = [];
    stepsPerFrame = Math.max(1, Math.round((1 / 30) / P.dt));
}

function readInitialValue () {
    const g = id => parseFloat(document.getElementById(id).value);
    y = [g("t1d")*(Math.PI/180), g("t2d")*(Math.PI/180), g("t1")*(Math.PI/180), g("t2")*(Math.PI/180)];
}

function addEvents (elementArray, eve, func) {
    for (let i = 0; i < elementArray.length; i++) {
        elementArray[i].addEventListener(eve, func);
    }
}

addEvents(document.getElementsByClassName("start-sim-btn"), "click", startSim);
addEvents(document.getElementsByClassName("stop-sim-btn"), "click", stopSim);
addEvents(document.getElementsByClassName("reset-sim-btn"), "click", resetSim);

let paramsElements = document.getElementsByClassName("params");
for (let i = 0; i < paramsElements.length; i++) {
    paramsElements[i].addEventListener("input", readParams);
}

let initialValueElements = document.getElementsByClassName("initial-value");
for (let i = 0; i < initialValueElements.length; i++) {
    initialValueElements[i].addEventListener("input", function () {
        if (!running) {
            readInitialValue();
            readParams();
            time = 0;
        }
    });
}

function startSim() {
    running = true;
}
function stopSim() {
    running = false;
}
function resetSim() {
    running = false;
    readParams();
    readInitialValue();
    time = 0;
}

// Handle window resize
function windowResized() {
    // Resize the canvas to fill the container whenever the window size changes
    let container = document.getElementById('canvas-container');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
}
