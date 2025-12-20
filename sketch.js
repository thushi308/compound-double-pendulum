// --- 1. GLOBAL VARIABLES ---
let r1, r2, m1, m2, g;
let a1 = Math.PI / 2; // Angle 1
let a2 = Math.PI / 2; // Angle 2
let a1_v = 0; // Angular velocity 1
let a2_v = 0; // Angular velocity 2
let cx, cy; // Center of canvas
let scale_factor = 100

// Trace path history
let path = [];

function setup() {
    // Attach canvas to our specific container
    let canvas = createCanvas(windowWidth - 300, windowHeight);
    canvas.parent('canvas-container');
    
    // Set origin to center-top for pendulum
    cx = width / 2;
    cy = height / 4;
    
    // Initialize Variables based on Inputs
    updateVariables();
    
    // Attach Reset Button Listener
    select('#reset-btn').mousePressed(resetSimulation);
}

function draw() {
    background(0);
    
    // --- 2. UPDATE INPUTS ---
    // We read sliders every frame to allow real-time tweaking
    updateVariables(); 

    // --- 3. PHYSICS ENGINE (YOUR CODE GOES HERE) ---
    /* INSERT YOUR ALGORITHM HERE. 
       You have access to: r1, r2, m1, m2, g, a1, a2
       Update a1_v, a2_v, a1, a2 accordingly.
    */
   
    // (Placeholder logic just to make it move slightly for demo)
    // a1 += 0.01; 
    // a2 -= 0.02;

    // --- 4. CALCULATE POSITIONS (Cartesian) ---
    let x1 = r1 * sin(a1) * scale_factor;
    let y1 = r1 * cos(a1) * scale_factor;
    let x2 = x1 + r2 * sin(a2) * scale_factor;
    let y2 = y1 + r2 * cos(a2) * scale_factor;

    let radius1 = m1 * scale_factor / 10;
    let radius2 = m2 * scale_factor / 10;

    // --- 5. VISUALIZATION ---
    translate(cx, cy); // Move (0,0) to pivot point

    stroke(255);
    strokeWeight(2);

    // Draw Rods
    line(0, 0, x1, y1);
    line(x1, y1, x2, y2);

    // Draw Bobs (Size based on mass)
    noStroke();
    fill(0, 188, 212);
    ellipse(x1, y1, radius1, radius1);
    
    fill(255, 64, 129);
    ellipse(x2, y2, radius2, radius2);
    
    // Optional: Draw Path
    path.push({x: x2, y: y2});
    if (path.length > 200) path.shift(); // Keep path short
    
    noFill();
    stroke(255, 64, 129, 100);
    strokeWeight(1);
    beginShape();
    for (let p of path) {
        vertex(p.x, p.y);
    }
    endShape();
}

// Helper to update variables from DOM elements
function updateVariables() {
    // Read values
    r1 = parseFloat(select('#l1').value());
    r2 = parseFloat(select('#l2').value());
    m1 = parseFloat(select('#m1').value());
    m2 = parseFloat(select('#m2').value());
    g  = parseFloat(select('#g').value());
}

function resetSimulation() {
    a1 = Math.PI / 2;
    a2 = Math.PI / 2;
    a1_v = 0;
    a2_v = 0;
    path = [];
}

// Handle window resize
function windowResized() {
    resizeCanvas(windowWidth - 300, windowHeight);
    cx = width / 2;
    cy = height / 4;
}
