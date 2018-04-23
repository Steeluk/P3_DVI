window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus({audioSupported: ['wav', 'mp3', 'ogg']})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        // Maximize this game to whatever the size of the browser is
        .setup(/*{maximize: true}*/)
        // And turn on default input controls and touch input (for UI)
        .controls(true).touch()
        // Enable sounds.
        .enableSound();
    // Load and init audio files.

    Q.scene("level1",function(stage) {
        Q.stageTMX("level.tmx",stage);
        stage.insert(new Q.Player(this));
        stage.add("viewport").follow(Q("Player").first());
        stage.viewport.offsetY = 130;
        stage.insert(new Q.Goomba(this, 200, 380));
        stage.insert(new Q.Goomba(this, 300, 380));
        stage.insert(new Q.Bloopa(this));
        stage.insert(new Q.Collectable(this));
        //stage.add("viewport").centerOn(150,380);
    });

    Q.scene('hud',function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: 50, y: 0
        }));

        var label = container.insert(new Q.UI.Text.extend("Score",{ init: function(p) {
                this._super({
                    label: "score: 0", x: 0,
                    y: 0
                });
                Q.state.on("change.score",this,"score");
            },
            score: function(score) {
                this.p.label = "score: " + score;
            }
        }));

        /*var label = container.insert(new Q.UI.Text({x:200, y: 20,
            label: "Score: " + stage.options.score, color: "white" }));*/

        /*var strength = container.insert(new Q.UI.Text({x:50, y: 20,
            label: "Health: " + stage.options.strength + '%', color: "white" }));*/

        container.fit(20);
    });



    Q.loadTMX("level.tmx, mario_small.json, mario_small.png, goomba.png, goomba.json, bloopa.png, bloopa.json, coin.png, coin.json", function() {
        Q.compileSheets("mario_small.png","mario_small.json");
        Q.compileSheets("goomba.png","goomba.json");
        Q.compileSheets("bloopa.png","bloopa.json");
        Q.compileSheets("coin.png","coin.json");
        /*Q.compileSheets("collectables.png","collectables.json");
        Q.compileSheets("enemies.png","enemies.json");
        Q.compileSheets("doors.png","doors.json");*/
        Q.animations("mario_anim", {
            marioR: { frames: [0,1,2], rate: 1/10, flip: false, loop: false },
            marioL: { frames:  [14,15,16], rate: 1/10, flip: false, loop: false },
            marioJumpR: { frames: [4], rate: 1/10, flip: false , loop: false},
            marioJumpL: { frames: [18], rate: 1/10, flip: false, loop: false},
            marioStand_right: { frames: [0], rate: 1/10, flip: false , loop: false},
            marioStand_left: { frames: [14], rate: 1/10, flip: false , loop: false},
            marioDead: { frames: [12], rate: 1/2, flip: false , loop: false, trigger: "m_dead"}
        });
        Q.animations("goomba_anim", {
            walk: { frames: [0,1], rate: 1/10, flip: false, loop: true },
            dead: { frames: [2], rate: 1/2, flip: false, loop: false, trigger: "dead" }
        });
        Q.animations("bloopa_anim", {
            walk: { frames: [0,1], rate: 1/2, flip: false, loop: true },
            dead: { frames: [2], rate: 1/2, flip: false, loop: false, trigger: "dead" }
        });
        Q.animations("coin_anim", {
            spin: {frames: [0, 1, 2], rate: 1/5, flip: false, loop: true}
        });

        /*Q.animations("fly", EnemyAnimations);
        Q.animations("slime", EnemyAnimations);
        Q.animations("snail", EnemyAnimations);*/
        Q.stageScene("level1");
        //Q.stageScene('hud', 3, Q('Player').first().p);

    }/*, {
        progressCallback: function(loaded,total) {
            var element = document.getElementById("loading_progress");
            element.style.width = Math.floor(loaded/total*100) + "%";
            if (loaded === total) {
                document.getElementById("loading").remove();
            }
        }
    }*/);


    Q.SPRITE_PLAYER = 1;
    Q.SPRITE_COLLECTABLE = 2;
    Q.SPRITE_ENEMY = 4;
    Q.SPRITE_DOOR = 8;
    Q.Sprite.extend("Player",{

        init: function(p) {

            this._super(p, {
                sheet: "mario",  // Setting a sprite sheet sets sprite width and height
                sprite: "mario_anim",
                x: 150,
                y:380,
                direction: "right",
                strength: 100,
                score: 0,
                dead: false/*
                standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
                duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
                jumpSpeed: -400,
                speed: 300,
                type: Q.SPRITE_PLAYER,
                collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE*/
            });

            //this.p.points = this.p.standingPoints;

            this.add('2d, platformerControls, animation, tween');
            this.on("m_dead", this, function () {
                this.destroy();
                this.resetLevel();
                //Q.stageScene("endGame", 1, {label: "You Died"});
            });

            /*this.on("bump.top","breakTile");

            this.on("sensor.tile","checkLadder");
            this.on("enemy.hit","enemyHit");
            this.on("jump");
            this.on("jumped");

            Q.input.on("down",this,"checkDoor");*/
        },
        resetLevel: function() {
            Q.stageScene("level1");
            //Q.stageScene.insert(this);
            //this.p.strength = 100;
            //this.animate({opacity: 1});
            //Q.stageScene('hud', 3, this.p);
        },
        die: function(){
            console.log("MUERTO");
            this.dead = true;
            this.play('marioDead');
            this.p.vy = -300;

        },
        /*destroyM: function(){
            this.destroy();
            Q.stageScene("endGame",1, { label: "You Died" });
        },*/
        /*,

        jump: function(obj) {
            // Only play sound once.
            if (!obj.p.playedJump) {
                Q.audio.play('jump.mp3');
                obj.p.playedJump = true;
            }
        },

        jumped: function(obj) {
            obj.p.playedJump = false;
        },

        checkLadder: function(colObj) {
            if(colObj.p.ladder) {
                this.p.onLadder = true;
                this.p.ladderX = colObj.p.x;
            }
        },

        checkDoor: function() {
            this.p.checkDoor = true;
        },

        enemyHit: function(data) {
            var col = data.col;
            var enemy = data.enemy;
            this.p.vy = -150;
            if (col.normalX == 1) {
                // Hit from left.
                this.p.x -=15;
                this.p.y -=15;
            }
            else {
                // Hit from right;
                this.p.x +=15;
                this.p.y -=15;
            }
            this.p.immune = true;
            this.p.immuneTimer = 0;
            this.p.immuneOpacity = 1;
            this.p.strength -= 25;
            Q.stageScene('hud', 3, this.p);
            if (this.p.strength == 0) {
                this.resetLevel();
            }
        },

        continueOverSensor: function() {
            this.p.vy = 0;
            if(this.p.vx != 0) {
                this.play("walk_" + this.p.direction);
            } else {
                this.play("stand_" + this.p.direction);
            }
        },

        breakTile: function(col) {
            if(col.obj.isA("TileLayer")) {
                if(col.tile == 24) { col.obj.setTile(col.tileX,col.tileY, 36); }
                else if(col.tile == 36) { col.obj.setTile(col.tileX,col.tileY, 24); }
            }
            Q.audio.play('coin.mp3');
        },*/

        step: function(dt) {
            //var processed = false;
            /*if (this.p.immune) {
                // Swing the sprite opacity between 50 and 100% percent when immune.
                if ((this.p.immuneTimer % 12) == 0) {
                    var opacity = (this.p.immuneOpacity == 1 ? 0 : 1);
                    this.animate({"opacity":opacity}, 0);
                    this.p.immuneOpacity = opacity;
                }
                this.p.immuneTimer++;
                if (this.p.immuneTimer > 144) {
                    // 3 seconds expired, remove immunity.
                    this.p.immune = false;
                    this.animate({"opacity": 1}, 1);
                }
            }

            if(this.p.onLadder) {
                this.p.gravity = 0;

                if(Q.inputs['up']) {
                    this.p.vy = -this.p.speed;
                    this.p.x = this.p.ladderX;
                    this.play("climb");
                } else if(Q.inputs['down']) {
                    this.p.vy = this.p.speed;
                    this.p.x = this.p.ladderX;
                    this.play("climb");
                } else {
                    this.continueOverSensor();
                }
                processed = true;
            }

            if(!processed && this.p.door) {
                this.p.gravity = 1;
                if(this.p.checkDoor && this.p.landed > 0) {
                    // Enter door.
                    this.p.y = this.p.door.p.y;
                    this.p.x = this.p.door.p.x;
                    this.play('climb');
                    this.p.toDoor = this.p.door.findLinkedDoor();
                    processed = true;
                }
                else if (this.p.toDoor) {
                    // Transport to matching door.
                    this.p.y = this.p.toDoor.p.y;
                    this.p.x = this.p.toDoor.p.x;
                    this.stage.centerOn(this.p.x, this.p.y);
                    this.p.toDoor = false;
                    this.stage.follow(this);
                    processed = true;
                }
            }*/

            if(!this.dead) {
                this.p.gravity = 1;


                    this.p.ignoreControls = false;
                    //this.p.points = this.p.standingPoints;

                if (this.p.landed <= 0) {
                    if (this.p.direction == "right")
                        this.play("marioJumpR");
                    else
                        this.play("marioJumpL");
                }
                else if (this.p.vx > 0) {
                    this.play("marioR");
                    this.p.direction = "right";
                }
                else if (this.p.vx < 0) {
                    this.play("marioL");
                    this.p.direction = "left";
                }
                else {
                    this.play("marioStand_" + this.p.direction);
                }



            }

            /*this.p.onLadder = false;
            this.p.door = false;
            this.p.checkDoor = false;*/


            if(this.p.y > 1000) {
                this.stage.unfollow();
            }

            if(this.p.y > 2000) {
                this.resetLevel();
            }
        }
    });

    Q.Sprite.extend("Goomba", {
        init: function(p, x, y) {

            this._super(p ,{
                sheet: "goomba",
                sprite: "goomba_anim",
                vx: 50,
                x: x,
                y: y,
                type: Q.SPRITE_ENEMY,
                collisionMask: Q.SPRITE_DEFAULT
            });
            this.add("2d, animation, default_enemy");
        },

        step: function(dt) {
            var p = this.p;

            p.vx += p.ax * dt;
            p.vy += p.ay * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;


        }
    });

    Q.Sprite.extend("Bloopa", {
        init: function(p) {

            this._super(p ,{
                sheet: "bloopa",
                sprite: "bloopa_anim",
                vy: -20,
                x: 100,
                y:520,
                gravity: 0,
                type: Q.SPRITE_ENEMY,
                collisionMask: Q.SPRITE_DEFAULT
            });
            this.add("2d, animation, default_enemy");
        },

        step: function(dt) {
            var p = this.p;
            if(p.y < 485)
                p.vy = -p.vy;

            if(p.y > 525)
                p.vy = -p.vy;
        }

    });

    Q.component("default_enemy", {
        added: function () {
            this.entity.on("bump.top",this.entity,"die");
            this.entity.on("bump.left,bump.right,bump.bottom",this.entity,"hit");
            this.entity.on("dead",this.entity,function() {
                //this.del('2d, aiBounce');
                this.destroy();
            });
            this.entity.play('walk');
        },

        extend: {
            die: function (col) {
                if (col.obj.isA("Player")) {
                    //Q.audio.play('coin.mp3');
                    this.p.vx = this.p.vy = 0;
                    this.play('dead');
                    col.obj.p.vy = -300;
                }
            },

            hit: function(col) {
                if(col.obj.isA("Player")) {
                    //Q.stageScene("endGame",1, { label: "You Died" });
                    col.obj.die();
                    //Q.audio.play('hit.mp3');
                }
            }
        }
    });

    Q.Sprite.extend("Collectable", {
        init: function(p) {
            this._super(p,{
                sheet: "coin",
                sprite: "coin_anim",
                type: Q.SPRITE_COLLECTABLE,
                collisionMask: Q.SPRITE_PLAYER,
                sensor: true,
                x: 550,
                y: 500,
                vx: 0,
                vy: 0,
                gravity: 0
            });
            this.add("animation");
            this.play("spin");

            this.on("sensor");
        },

        // When a Collectable is hit.
        sensor: function(colObj) {
            // Increment the score.
            if (this.p.amount) {
                colObj.p.score += this.p.amount;
                Q.stageScene('hud', 3, colObj.p);
            }
            //Q.audio.play('coin.mp3');
            this.destroy();
        }
    });


    });
