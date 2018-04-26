window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` component.
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
        stage.insert(new Q.Goomba(this, 300, 380));
        stage.insert(new Q.Goomba(this, 400, 380));
        stage.insert(new Q.Bloopa(this, 100, 520));
        stage.insert(new Q.Collectable(this, 200, 480));
        stage.insert(new Q.Princess({x: 1300, y: 380}));
    });

    Q.scene('hud',function(stage) {
        var container = stage.insert(new Q.UI.Container({ x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0)" }));
        var label = container.insert(new Q.Score());

        container.fit(20);
    });

    Q.UI.Text.extend("Score",{
        init: function(p) {
            this._super({ label: "score: ", x: 10-Q.width/2, y: 10-Q.height/2, weight: 100, size: 15, family: "SuperMario", color: "#FFFFFF", outlineWidth: 4, align: "left" });
            Q.state.on("change.score",this,"score");
            this.score(Q.state.get("score"));
        },
        score: function(score) {
            this.p.label = "score: " + score;
        }
    });


    Q.scene('titleScreen',function(stage) {
        var container = stage.insert(new Q.UI.Container({ x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)" }));
        var button = container.insert(new Q.UI.Button({ asset: "mainTitle.png", x: 0, y: 0, keyActionName:['confirm', 'fire', 'action'] }));
        var label = container.insert(new Q.UI.Text({x:0, y: 70, weight: 100, size: 24, family: "SuperMario", color: "#FFFFFF", outlineWidth: 4, label: "Start" }));

        button.on("click",function() {
            Q.clearStages();
            Q.state.reset({score: 0});
            Q.stageScene('level1');
            Q.stageScene("hud",1);
        });

        container.fit(20);
    });

    Q.scene('endGame',function(stage) {
        var container = stage.insert(new Q.UI.Container({ x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)" }));
        var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Play Again", font: "100 20px SuperMario", fontColor: "#000000", keyActionName:['confirm', 'fire', 'action']  }));
        var label = container.insert(new Q.UI.Text({x: 0, y: -10 - button.p.h, label: stage.options.label, family: "SuperMario", color: "#FFFFFF" }));

        button.on("click",function() {
            Q.clearStages();
            Q.stageScene('titleScreen');
        });

        button.on("push",function() {
            Q.clearStages();
            Q.stageScene('titleScreen');
        });

        container.fit(20);
    });


    Q.loadTMX("level.tmx, mario_small.json, mario_small.png, goomba.png, goomba.json, bloopa.png, bloopa.json, coin.png, coin.json, mainTitle.png, princess.png", function() {
        Q.compileSheets("mario_small.png","mario_small.json");
        Q.compileSheets("goomba.png","goomba.json");
        Q.compileSheets("bloopa.png","bloopa.json");
        Q.compileSheets("coin.png","coin.json");

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
        Q.stageScene('titleScreen');

    });


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
                dead: false,
                type: Q.SPRITE_PLAYER,
                collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_COLLECTABLE
            });

            this.add('2d, platformerControls, animation, tween');
            this.on("m_dead", this, function () {
                this.destroy();
                Q.stageScene("endGame",1, { label: "Game Over" });
            });
        },
        die: function(){
            this.dead = true;
            this.play('marioDead');
            this.p.vy = -300;

        },
        step: function(dt) {

            if(!this.dead) {
                this.p.gravity = 1;
                this.p.ignoreControls = false;

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

                if(this.p.y > 1000) {
                    this.stage.unfollow();
                }

                if(this.p.y > 2000) {
                    this.destroy();
                    Q.stageScene("endGame",1, { label: "Game Over" });
                }
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
        init: function(p, x, y) {

            this._super(p ,{
                sheet: "bloopa",
                sprite: "bloopa_anim",
                vy: -20,
                x: x,
                y: y,
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
                this.destroy();
            });
            this.entity.play('walk');
        },
        extend: {
            die: function (col) {
                if (col.obj.isA("Player")) {
                    this.p.vx = this.p.vy = 0;
                    this.play('dead');
                    col.obj.p.vy = -300;
                }
            },
            hit: function(col) {
                if(col.obj.isA("Player")) {
                    col.obj.die();
                }
            }
        }
    });

    Q.Sprite.extend("Collectable", {
        init: function(p, x, y) {
            this._super(p,{
                sheet: "coin",
                sprite: "coin_anim",
                type: Q.SPRITE_COLLECTABLE,
                collisionMask: Q.SPRITE_PLAYER,
                sensor: true,
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                gravity: 0
            });
            this.add("animation, tween");
            this.play("spin");
            this.on("sensor");
        },
        // When a Collectable is hit.
        sensor: function(colObj) {
            // Increment the score.
            Q.state.inc("score", 100);
            this.animate({y: this.p.y-50}, 0.3, Q.Easing.Linear, {callback: function(){ this.destroy() } });
        }
    });

    Q.Sprite.extend("Princess",{

        init: function(p) {
            this._super(p, {
                asset: "princess.png",
                type: Q.SPRITE_FRIENDLY,
                sensor: true
            });
            this.add('2d');
            this.on("sensor");
        },
        sensor: function(collision) {
            collision.destroy();
            Q.stageScene("endGame",1, { label: "You Win" });
        }
    });

});
