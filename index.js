// Matter.js boiler plate
const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 15;
const cellsVertical = 12;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLenghtX = width/cellsHorizontal;
const unitLenghtY = height/cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);


//walls
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, {isStatic:true}),
    Bodies.rectangle(width, height/2, 2, height, {isStatic:true})
];
World.add(world, walls);


//maze gen
const shuffle = (arr) => {
    let counter = arr.length;
    while(counter>0){
        const index = Math.floor(Math.random()*counter);
        counter--;
        const temp = arr[index];
        arr[index] = arr[counter];
        arr[counter] = temp;
    }
    return arr;
};


const Maze = () => {
const grid = Array(cellsVertical).fill(null).map(()=>Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal-1).fill(false));
const horizontals = Array(cellsVertical-1).fill(null).map(() => Array(cellsHorizontal).fill(false));


const startRow = Math.floor(Math.random()*cellsVertical);
const startCollumn = Math.floor(Math.random()*cellsHorizontal);

const stepThroughCell = (row, collumn) => {
//if i have visited the cell at [row, column, then return]
if (grid[row][collumn] === true){
    return;
};

//mark this cell as being visited
grid[row][collumn] = true;

//assemnble randomly-ordered list of neighbours
const neighbours =shuffle( [
    [row-1, collumn, 'up'],
    [row, collumn+1, 'right'],
    [row+1, collumn, 'down'],
    [row, collumn-1, 'left']
]);

//for each neighbour...
for(let neighbour of neighbours){
    const [nextRow, nextCollumn, direction] = neighbour

//see if that neighbour is out of bounds
if(nextRow < 0 || nextRow >= cellsVertical || nextCollumn<0 || nextCollumn>=cellsHorizontal){
    continue;
};

//if we have visited that neighbour, continue to next one
if(grid[nextRow][nextCollumn]){
    continue;
};

//remove a wall from either horizontals or verticals
if (direction === 'left'){
    verticals[row][collumn-1] = true;
} else if(direction === 'right'){
    verticals[row][collumn] = true;
} else if (direction === 'up'){
    horizontals[row-1][collumn] = true;
} else if (direction === 'down'){
    horizontals[row][collumn] = true;
}
stepThroughCell(nextRow, nextCollumn);
};
//visit next cell
};

stepThroughCell(startRow, startCollumn);

//Horizontal walls
horizontals.forEach((row, rowIndex)=>{
    row.forEach((open, columnIndex)=>{
        if(open === true){
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX/2,
            rowIndex * unitLenghtY + unitLenghtY,
            unitLenghtX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall)
    });
});

//Vertical walls
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open === true){
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX,
            rowIndex * unitLenghtY + unitLenghtY/2,
            5,
            unitLenghtY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});

//Goal
const goal = Bodies.rectangle(
    width - unitLenghtX/2,
    height - unitLenghtY/2,
    unitLenghtX * 0.7,
    unitLenghtY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal)

//Ball
const ballRadius = Math.min(unitLenghtX, unitLenghtY)/4;
const ball = Bodies.circle(
    unitLenghtX/2,
    unitLenghtY/2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'blue'
        }
    }
);
World.add(world, ball);
document.addEventListener('keydown', event => {
    const {x,y} = ball.velocity;
    if (event.key === 'w'){
        Body.setVelocity(ball, {x, y: y-5});
    }
    if (event.key === 'd'){
        Body.setVelocity(ball, {x: x+ 5, y});
    }
    if (event.key === 's'){
        Body.setVelocity(ball, {x, y: y+5});
    }
    if (event.key === 'a'){
        Body.setVelocity(ball, {x: x-5, y});
    }
});

//Start condition

document.addEventListener('keypress', event => {
const start = document.querySelector('.start');
const instructions = document.querySelector('.instructions');
    start.classList.add('hidden');
    instructions.classList.add('hidden');
})


//Win condition



Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision)=>{
        const labels = ['ball', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            document.querySelector('.button').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false)
                }
            });
        };
    });
});
};

Maze();

const initializeButton = document.querySelector('#buttonSet')
initializeButton.addEventListener('click', event => {
    location.reload();
})





    