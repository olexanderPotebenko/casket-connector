const WIDTH_CANVAS  = 540, 
        HEIGHT_CANVAS = 400, 
        WIDTH_CELLS = 50, HEIGHT_CELLS = 50,
        COUNT_ROWS = 6 , COUNT_COLUMNS = 6 ;

// создаем новую сцену с именем "Game"
let gameScene = new Phaser.Scene('Game');

let config = {
  type: Phaser.AUTO,  
  width: 540,
  height: 400,
  scene: gameScene,
  backgroundColor: "#6495ED" 
};

let game = new Phaser.Game(config);


gameScene.preload = function() {

  this.load.image("site", "image/site100.png");
  this.load.image("target_site", "image/target_site100.png");
  this.load.image("rook", "image/rook100.png");

  this.load.image("arrow_up", "image/arrow_up.png");
  this.load.image("arrow_light_up", "image/arrow_light_up.png");
  this.load.image("arrow_right", "image/arrow_right.png");
  this.load.image("arrow_light_right", "image/arrow_light_right.png");

  this.load.image("you_win", "image/you_win.jpg");
};

gameScene.create = function() {
  let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xaaaaaa];
  
  this.createSites();
  this.target_sites_arr = [];
  this.createTargetSite({i: 0, j: 0, color: colors[0]});
  this.createTargetSite({i: 0, j: 5, color: colors[1]});
  this.createTargetSite({i: 3, j: 0, color: colors[2]});
  this.createTargetSite({i: 2, j: 5, color: colors[3]});

  this.rooks_group = this.add.group();
  this.createRook({i: 1, j: 0, color: colors[0]});
  this.createRook({i: 1, j: 5, color: colors[1]});
  this.createRook({i: 4, j: 1, color: colors[2]});
  this.createRook({i: 2, j: 5, color: colors[3]});

};

gameScene.update = function(){

  let win = this.checkWin(this.target_sites_arr);
  if(win) {
    let img = this.add.image(270,200, "you_win");
    img.setAlpha(0.1);
    img.scaleY = 1.1;
  }else{

    let cursor = this.input.activePointer.positionToCamera(this.cameras.main);

    this.rooks_group.getChildren().forEach((rook) => {

      rook.list.slice(1, 5).forEach((arrow) => {
        if(
          cursor.x > rook.x - rook.width/2 + arrow.x - arrow.width/4 &&
          cursor.x < rook.x + rook.width/2 + arrow.x + arrow.width/4 &&
          cursor.y > rook.y - rook.height/2 + arrow.y - arrow.height/4 &&
          cursor.y < rook.y + rook.height/2 + arrow.y + arrow.height/4){

          arrow.setTexture(arrow.texture2);
          setTimeout(() => arrow.setTexture(arrow.texture1) , 70);

          if(this.input.manager.activePointer.isDown && arrow.interactive){
            let new_pos = this.getNewRookPos(arrow);   
            this.moveRook(rook, new_pos);
          };
        };
      });
      this.updateStateLock(this.target_sites_arr, this.rooks_group);

    });
  }
  /*   let x = Phaser.Math.Between(100, 700);*/
  /*    let y = Phaser.Math.Between(100, 500);*/

}

function getPosition(i, j){
  let pos = {x: 0, y: 0};
      pos.x = (WIDTH_CANVAS - WIDTH_CELLS * COUNT_COLUMNS)/2 
        + WIDTH_CELLS * j + WIDTH_CELLS/2;
      pos.y = (HEIGHT_CANVAS - HEIGHT_CELLS * COUNT_ROWS)/2 
        + HEIGHT_CELLS * i + HEIGHT_CELLS/2;
  return pos;
}

gameScene.createTargetSite = function(data){
  this.target_sites = this.add.group();
  this.target_sites.color = data.color;
  let pos = getPosition(data.i, data.j);
  this.target_sites.add(this.add.image(pos.x, pos.y, "target_site"));
  Phaser.Actions.ScaleXY(this.target_sites.getChildren(), -0.5, -0.5);

  let graphics = this.add.graphics({ 
    fillStyle: { color: data.color}
  });
  let circle = new Phaser.Geom.Circle(pos.x, pos.y, 11);
  let circ = graphics.fillCircleShape(circle);
  this.target_sites.add(circ);
 
  graphics = this.add.graphics({ 
    fillStyle: { color: 0xffffff}
  });
  circle = new Phaser.Geom.Circle(pos.x, pos.y, 11);
  circ = graphics.fillCircleShape(circle);
  circ.setAlpha(0);
  this.target_sites.add(circ);


  this.target_sites_arr.push(this.target_sites);

}


gameScene.createSites = function(x, y, width, height){
  this.sites = this.add.group();
  
  for(let j = 0; j < COUNT_ROWS; j++){
    for(let i = 0; i < COUNT_COLUMNS; i++){
      let pos = getPosition(i, j);
      this.sites.add(this.add.image(pos.x, pos.y, "site"));
    };
  };
  
/*  Phaser.Actions.SetOrigin(this.sites.getChildren(), 0,0);*/

  Phaser.Actions.ScaleXY(this.sites.getChildren(), -0.5, -0.5);
  }

gameScene.createRook = function(data){

  let pos = getPosition(data.i, data.j);
  this.rook_container = this.add.container(pos.x, pos.y);
  this.rook_container.x_virt = pos.x;
  this.rook_container.y_virt = pos.y;
  this.rook_container.color = data.color;

  let graphics = this.add.graphics({ 
    lineStyle: { width: 4.2, color: data.color}, 
  });

  let circle = new Phaser.Geom.Circle(0, 0, 14.8);
  let circ = graphics.strokeCircleShape(circle);
  this.rook_container.add(circ);
  this.rooks_group.add(this.rook_container);

  this.arrow_group = this.add.group();
  let arrow_up = this.add.image(0, -20, "arrow_up");
  let arrow_right = this.add.image(+20, 0, "arrow_right");
  let arrow_down = this.add.image(0, +20, "arrow_up");
  let arrow_left = this.add.image(-20, 0, "arrow_right");

  arrow_up.dir = "up";
  arrow_right.dir = "right";
  arrow_down.dir = "down";
  arrow_left.dir = "left";

  arrow_up.texture1 = "arrow_up";
  arrow_up.texture2 = "arrow_light_up";
  arrow_down.texture1 = "arrow_up";
  arrow_down.texture2 = "arrow_light_up";
  arrow_right.texture1 = "arrow_right";
  arrow_right.texture2 = "arrow_light_right";
  arrow_left.texture1 = "arrow_right";
  arrow_left.texture2 = "arrow_light_right";
  arrow_down.setRotation(3.14159);
  arrow_left.setRotation(3.14159);

  this.arrow_group.add(arrow_up);
  this.arrow_group.add(arrow_right);
  this.arrow_group.add(arrow_down);
  this.arrow_group.add(arrow_left);

/*  this.arrow_group.rotate(0, 1.5708);*/

/*  this.arrow_group.getChildren()[1].width = 25;*/
/*  this.arrow_group.getChildren()[1].height= 45;*/
/*  this.arrow_group.getChildren()[3].width = 25;*/
/*  this.arrow_group.getChildren()[3].height= 45;*/

  this.arrow_group.getChildren().forEach((item) => item.interactive = true);

  Phaser.Actions.ScaleXY(this.arrow_group.getChildren(), -0.5, -0.5);
  Phaser.Actions.SetAlpha(this.arrow_group.getChildren(), 1);

  this.rook = this.add.image(0, 0, "rook");

  this.rook.scale = 0.5;


  this.rook_container.add(this.arrow_group.getChildren());
  this.rook_container.add(this.rook);



/*  let circle = new Phaser.Geom.Circle(pos.x, pos.y, 11);*/
/*  let circ = graphics.fillCircleShape(circle);*/
/*  this.target_sites.add(circ);*/
}

/*как было бы здорово, будь уменя класс Rook :) */
gameScene.getNewRookPos = function(arrow){

  let dir = arrow.dir;
  let rook = arrow.parentContainer;
  let rook_arr = this.rooks_group.getChildren();

  let y, x;
  switch(dir){
    case "up":
      y = getPosition(0, 0).y - HEIGHT_CELLS;
      for(let i = 0; i < rook_arr.length; i++){
        if(rook_arr[i].x_virt == rook.x_virt && 
          rook_arr[i].y_virt < rook.y_virt &&
          rook_arr[i].y_virt > y){
          y = rook_arr[i].y_virt;
        };
      };
      rook.y_virt = y + HEIGHT_CELLS;
      return {x: rook.x_virt, y: y + HEIGHT_CELLS}; 
      break;
    case "right":
      x = getPosition(5, 5).x + WIDTH_CELLS;
      for(let i = 0; i < rook_arr.length; i++){
        if(rook_arr[i].y_virt == rook.y_virt && 
          rook_arr[i].x_virt > rook.x_virt &&
          rook_arr[i].x_virt < x){
          x = rook_arr[i].x_virt;
        };
      };
      rook.x_virt = x - WIDTH_CELLS;
      return {x: x - WIDTH_CELLS, y: rook.y_virt};       
      break;
    case "down":
      y = getPosition(5, 5).y + HEIGHT_CELLS;
      for(let i = 0; i < rook_arr.length; i++){
        if(rook_arr[i].x_virt == rook.x_virt && 
          rook_arr[i].y_virt > rook.y_virt &&
          rook_arr[i].y_virt < y){
          y = rook_arr[i].y_virt;
        };
      };
      rook.y_virt = y - HEIGHT_CELLS;
      return {x: rook.x_virt, y: y - HEIGHT_CELLS}; 
      break;
    case "left":
      x = getPosition(0, 0).x - WIDTH_CELLS;
      for(let i = 0; i < rook_arr.length; i++){
        if(rook_arr[i].y_virt == rook.y_virt && 
          rook_arr[i].x_virt < rook.x_virt &&
          rook_arr[i].x_virt > x){
          x = rook_arr[i].x_virt;
        };
      };
      rook.x_virt = x + WIDTH_CELLS;
      return {x: x + WIDTH_CELLS, y: rook.y_virt};       
      break;
  };
}

gameScene.moveRook = function(rook, new_pos){
  if(rook.x == new_pos.x && rook.y == new_pos.y)
    return;

  rook.list.slice(1, 5).forEach((item) => item.interactive = false);


  let delta_x = rook.x - new_pos.x;
  let delta_y = rook.y - new_pos.y;
  let step_x = delta_x != 0? 1400 / ((delta_x * 7/WIDTH_CELLS) * 9): 0;
  let step_y = delta_y != 0? 1400 / ((delta_y * 7/HEIGHT_CELLS) * 9): 0;
  

  let interval = setInterval(() => {
    if(delta_x != 0 && rook.x - new_pos.x < 9 && rook.x - new_pos.x > -9 ||
      delta_y != 0 && rook.y - new_pos.y < 9 && rook.y - new_pos.y > -9){
      rook.x = rook.x_virt;
      rook.y = rook.y_virt;
      rook.list.slice(1, 5).forEach((item) => item.interactive = true);
      clearInterval(interval);
    }else{
      rook.x -= step_x;
      rook.y -= step_y;
    }
    
  }, 20);
}

gameScene.updateStateLock = function(sites_arr, rooks_group){
  sites_arr.forEach((state) => {
    for(let rook of rooks_group.getChildren()){ 
      if(state.getChildren()[0].x == rook.x && state.getChildren()[0].y == rook.y){
        state.getChildren()[2].setAlpha(.3);
        state.lock = true;
        break;
      }else{ 
        state.getChildren()[2].setAlpha(0);
        state.lock = false;
      };
    };
  });
}

gameScene.checkWin = function(sites_arr){
 let result = sites_arr.reduce((sum, item) => item.lock ? ++sum: sum, 0);
  return result == sites_arr.length ? true: false;
}




