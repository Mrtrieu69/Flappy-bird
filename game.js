window.onload = () => {
    // Selector element by css selector
    const cvs = document.querySelector("#bird")
    const ctx = cvs.getContext("2d")

    // Get parameters of cvs
    const CVS_WIDTH = cvs.width
    const CVS_HEIGHT = cvs.height

    //The game variable
    let frames = 0
    const DEG = Math.PI / 180
    const BEST_SCORE_KEY = "BEST_SCORE"

    // Load image
    const sprite = new Image()
    sprite.src = "img/sprite.png"

    // Load sounds
    const SCORE_S = new Audio()
    SCORE_S.src = "audio/sfx_point.wav"

    const FLAP_S = new Audio()
    FLAP_S.src = "audio/sfx_flap.wav"

    const HIT_S = new Audio()
    HIT_S.src = "audio/sfx_hit.wav"

    const DIE_S = new Audio()
    DIE_S.src = "audio/sfx_die.wav"

    const SWOOSHING_S = new Audio()
    SWOOSHING_S.src = "audio/sfx_swooshing.wav"

    // Game state 
    const state = {
        current: 0,
        getReady: 0,
        game: 1,
        over: 2,
    }

    // Start button coordinates
    const startBtn = {
        x: 120,
        y: 263,
        w: 83,
        h: 29,
    }

    // Handle events for control the game
    cvs.onclick = (e) => {
        switch(state.current){
            case state.getReady: 
                state.current = state.game
                SWOOSHING_S.play()
                break
            case state.game:
                bird.flap()
                FLAP_S.play()
                break
            case state.over:
                let { left, top } = cvs.getBoundingClientRect()
                let clickX = e.clientX - left
                let clickY = e.clientY - top
                if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                    // Reset game parameters
                    bird.resetSpeed()
                    score.resetValue()
                    pipes.resetPosition()
                    state.current = state.getReady
                }
                break
        }

    }

    // Background
    const bg = {
        sX: 0,
        sY: 0,
        w: 275,
        h: 226,
        x: 0,
        y: CVS_HEIGHT - 226,

        draw(){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
        },
    }

    // Foreground
    const fg = {
        sX: 276,
        sY: 0,
        w: 224,
        h: 112,
        x: 0,
        y: CVS_HEIGHT - 112,

        dx: 3,

        draw(){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)

        },
        update(){
            if(state.current === state.game){
                this.x = (this.x - this.dx) % (this.w/2)
            }
        }
    }

    // Bird
    const bird = {
        animations: [
            {sX: 276, sY: 112},
            {sX: 276, sY: 139},
            {sX: 276, sY: 164},
            {sX: 276, sY: 139},
        ],
        w: 34,
        h: 26,
        x: 50,
        y: 150,

        frame: 0,

        speed: 0,
        gravity: 0.35,
        jump: 5,
        radius: 12,
        rotation: 0,

        draw(){
            let bird = this.animations[this.frame]
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.rotate(this.rotation)
            ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h)
            ctx.restore()
        },

        flap(){
            this.speed = -this.jump
        },

        update(){
            // The bird flap slowly, if the game state is get ready state
            this.period = state.current === state.getReady ? 10 : 5
            // Increment the fame by, each period
            this.frame += frames % this.period === 0 ? 1 : 0
            // Frame goes only from 0 to 4
            this.frame = this.frame % this.animations.length

            if(state.current === state.getReady){
                this.y = 150
                this.rotation = 0 * DEG
            }else{
                this.speed += this.gravity
                this.y += this.speed
                if(this.y + this.h/2 >= CVS_HEIGHT - fg.h){
                    this.y = CVS_HEIGHT - fg.h - this.h/2
                    if(state.current  !== state.over){
                        DIE_S.play()
                    }
                    state.current = state.over
                }
                if(this.y - this.radius <= 0){
                    this.y = this.radius
                }
                if(this.speed >= this.jump){
                    this.rotation =  90 * DEG 
                    this.frame = 1
                }else{
                    this.rotation = -25 * DEG
                }
            }
        },

        resetSpeed(){
            this.speed = 0
        }
    }

    // Get ready message
    const getReady = {
        sX: 0,
        sY: 228,
        w: 173,
        h: 152,
        x: CVS_WIDTH / 2 - 173/2,
        y: 80,

        draw(){
            if(state.current === state.getReady){
                ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
            }
        }
    }

    // Game over message
    const gameOver = {
        sX: 175,
        sY: 228,
        w: 228,
        h: 202,
        x: CVS_WIDTH / 2 - 228/2,
        y: 90,

        draw(){
            if(state.current === state.over){
                ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
            }
        }
    }   
    
    // Pipes
    const pipes = {
        position: [],
        top: {
            sX: 553,
            sY : 0,
        },
        bottom: {
            sX : 502,
            sY: 0,
        },

        w: 53,
        h: 400,
        gap: 85,
        maxYPos: -170,
        dx: 3,

        draw(){
            for(const p of this.position){
                let topYPos = p.y
                let bottomYPos = p.y + this.h + this.gap
                ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h)
                ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)
            }
        },

        update(){
            if(state.current !== state.game) return
            if(frames % 100 === 0){
                this.position.push({
                    x: CVS_WIDTH,
                    y: this.maxYPos * (Math.random() + 1)
                })
            }

            for(const p of this.position){
                p.x -= this.dx
                let bottomPipeYPos = p.y + this.h + this.gap
                // Delete the pipes from the array, when they go beyond canvas
                if(p.x + this.w <= 0){
                    this.position.shift()
                    score.value++
                    SCORE_S.play()
                    score.best = Math.max(score.value, score.best)
                    localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(score.best))
                }

                // Check is bird in the pipes
                if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && 
                    (bird.y - bird.radius < p.y + this.h || bird.y + bird.radius > bottomPipeYPos))
                {
                    state.current = state.over
                    HIT_S.play()
                }
            }
        },

        resetPosition(){
            this.position = []
        }
    }

    // Score
    const score = {
        best: JSON.parse(localStorage.getItem(BEST_SCORE_KEY)) || 0,
        value: 0,

        draw(){
            ctx.fillStyle = "#FFF"
            ctx.strokeStyle = "#000"
            if(state.current === state.game){
                ctx.font = "35px Teko"
                ctx.lineWidth = 2
                ctx.fillText(this.value, CVS_WIDTH / 2, 50)
                ctx.strokeText(this.value, CVS_WIDTH / 2, 50)
            }else if(state.current === state.over){
                ctx.font = "25px Teko"
                // Score value
                ctx.fillText(this.value, 225, 186)
                ctx.strokeText(this.value, 225, 186)
                // Best value
                ctx.fillText(this.best, 225, 228)
                ctx.strokeText(this.best, 225, 228)
            }
        },

        resetValue(){
            this.value = 0
        }
    }

    // Medals 
    const medals = {
        bronze: {
            sX: 360,
            sY: 158,
        },
        silver: {
            sX: 312,
            sY: 112,
        },
        gold: {
            sX: 312,
            sY: 158,
        },
        x: 72,
        y: 177,
        w: 43,
        h: 43,

        draw(){
            if(state.current === state.over){
                if(score.value <= 3 && score.value >=1){
                    ctx.drawImage(sprite, this.bronze.sX, this.bronze.sY, this.w, this.h, this.x, this.y, this.w, this.h)
                }else if(score.value > 3 && score.value <= 6){
                    ctx.drawImage(sprite, this.silver.sX, this.silver.sY, this.w, this.h, this.x, this.y, this.w, this.h)
                }else if(score.value > 6){
                    ctx.drawImage(sprite, this.gold.sX, this.gold.sY, this.w, this.h, this.x, this.y, this.w, this.h)
                }
            }
        }
    }

    // Draw
    function draw(){
        ctx.fillStyle = "#70c5ce"
        ctx.fillRect(0, 0, CVS_WIDTH, CVS_HEIGHT)
        bg.draw()
        pipes.draw()
        fg.draw()
        bird.draw()
        getReady.draw()
        gameOver.draw()
        score.draw()
        medals.draw()
    }

    // Update
    function update(){
        bird.update()
        fg.update()
        pipes.update()
    }

    // Loop
    function loop(){
        update()
        draw()
        frames++
        setTimeout(() => loop(), 1000/60)
    }

    // Game start
    loop()
}