import React from 'react';
import {useState,useMemo,useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import './components/main.css';
import {createField} from './components/createField.js';
const mine=-1;


// If the number consists of one digit, the function adds a zero to the beginning.
function convertTime(time){
  return time.toString().padStart(2,"0");
}

// images of field elements
const imagesField= new Map([
  [-1,"/img/-1.jpg"],
  [0,"/img/0.jpg"],
  [1,"/img/1.jpg"],
  [2,"/img/2.jpg"],
  [3,"/img/3.jpg"],
  [4,"/img/4.jpg"],
  [5,"/img/5.jpg"],
  [6,"/img/6.jpg"],
  [7,"/img/7.jpg"],
  [8,"/img/8.jpg"],
  ]);

// mask images
const blockStates={
  visible:null,
  invisible:"/img/mask.jpg",
  flag:"/img/flag.jpg",
  bomb:"/img/bombboom.jpg",
  question:"/img/q.jpg"
};

// main button images
const imgStates={
  happy:"/img/happySmile.jpg",
  dead:"/img/deathSmile.jpg",
  omg:"/img/OMGSmile.jpg",
  cool:"/img/coolSmile.jpg",
  pressed:"/img/happySmilePressed.jpg"
};

const App =()=>{

  // base data about game
  const size=16;
  const bombs=30;
  const globalTime=40*60;

  // empty array to create a field
  const dimention = new Array(size).fill(null);

  // states of the game
  const [start,setStart]=useState(false);
  const [death,setDeath]=useState(false);
  const [field, setField] = useState(()=>new Array(size*size).fill(0));
  const [mask, setMask] = useState(()=> new Array(size*size).fill(blockStates.invisible));

  //timer
  const [time, setTime]=useState(globalTime);
  const [timeCounting,setTimeCounting]=useState(false);

  const minutes=convertTime(Math.floor(time/60));
  const minuteFirstNum="/img/time"+minutes[0]+".jpg";
  const minuteSecondNum="/img/time"+minutes[1]+".jpg";

  const seconds=convertTime(Math.floor(time-minutes*60));
  const secFirstNum="/img/time"+seconds[0]+".jpg";
  const secSecondNum="/img/time"+seconds[1]+".jpg";

  useEffect(()=>{
    const interval=setInterval(()=>{
      timeCounting && setTime((time)=>(time>=1 ? time-1 : 0))
    },1000);
    return ()=>{
      clearInterval(interval);
    };
  },[timeCounting]);

  // End of the game when time runs out
  useEffect(()=>{
    if (time==0) {
      setDeath(true);
      setGameStatus(imgStates.dead);
      field.forEach((_, i) => {
        if (field[i] == mine && mask[i]!=blockStates.flag) mask[i] = blockStates.visible;
      });
      setMask((prev)=>[...prev]);
    }
  },[time]);


  // main button state
  const [gameStatus, setGameStatus]=useState(imgStates.happy);

  // checking when the player win the game
  const endgame=useMemo(()=> start && !field.some(
    (f,i)=> 
      ((f!==mine && mask[i] === blockStates.flag) || (f===mine && mask[i] === blockStates.invisible))
    ),[field,mask],
  );
  useEffect(()=>{
    if (start && !death){
      setGameStatus(imgStates.cool);
      setTimeCounting(false);
    }
  },[endgame]);


  return(
  <div className="game">
  <p className="author">Профильное задание в виде игры <span>"Сапер"</span>, Васильев Андрей</p>
    <div className="gameInfo">
      <div className="timer">
        <img src="/img/time0.jpg" alt=""/>
        <img src={minuteFirstNum} alt=""/>
        <img src={minuteSecondNum} alt=""/>
      </div>

      <div className="mainButton">
        <img 
        onClick={()=>{
          // restart the game
          setGameStatus(imgStates.happy);
          setStart(false);
          setDeath(false);
          setTimeCounting(false);
          setTime(globalTime);
          setMask(()=> new Array(size*size).fill(blockStates.invisible));
          setField(()=>new Array(size*size).fill(0));
        }} src={gameStatus}/>
      </div>

      <div className="timer">
        <img src="/img/time0.jpg" alt=""/>
        <img src={secFirstNum} alt=""/>
        <img src={secSecondNum} alt=""/>
      </div>  

    </div>
    <div className="gameBlock">
    {dimention.map((_,y)=>{
      return(
        <div key={y} className="yField">
          {dimention.map((_,x)=>{
            return (<div key={x} className="xField" 

              onMouseDown={()=>{
                // change the main picture to pressed state
                if (death || endgame) return;
                setGameStatus(imgStates.pressed);
              }}
              onMouseUp={()=>{
                // change the main picture to original state
                if (death || endgame) return;
                setGameStatus(imgStates.happy);
              }}

              onClick={()=>{

                // start game
                if (!start){
                  setField(createField(size,bombs,x,y));
                  setStart(true);
                  setTimeCounting(true);
                  return;
                }
                if (death || endgame) return;
                if (mask[y*size+x]===blockStates.visible) return;

                // field cleaning without mines
                const cleaning=[[]];
                function clear(x,y) {
                  if (x<size && x>=0 && y>=0 && y<size) {
                    if (mask[y*size+x]===blockStates.visible) return;
                    cleaning.push([x,y]);
                  }
                }
                clear(x,y);
                while(cleaning.length){
                  const [x,y]=cleaning.pop();
                  mask[y*size+x]=blockStates.visible;
                  if (field[y * size + x] !== 0) continue;
                  clear(x+1,y);
                  clear(x,y+1);
                  clear(x-1,y);
                  clear(x,y-1);
                }
                mask[y*size+x]=blockStates.visible;

                // player loss
                if (field[y * size + x] === mine) {
                  field.forEach((_, i) => {
                    if (field[i] == mine && mask[i]!=blockStates.flag) mask[i] = blockStates.visible;
                });
                  mask[y*size+x]=blockStates.bomb;
                  setGameStatus(imgStates.dead);
                  setTimeCounting(false);
                  setDeath(true);
                }
                
                // update field
                setMask((prev)=>[...prev]);

              }}
              onContextMenu={(e)=>{
                // put a flag or a question
                e.preventDefault();
                e.stopPropagation();
                if (death || endgame) return;
                if (!start) return;
                if (mask[y*size+x]===blockStates.visible) return;
                if (mask[y*size+x]===blockStates.invisible){
                  mask[y*size+x]=blockStates.flag;
                }
                else if(mask[y*size+x]===blockStates.flag){
                  mask[y*size+x]=blockStates.question;
                }
                else if(mask[y*size+x]===blockStates.question){
                  mask[y*size+x]=blockStates.invisible;
                }
                setMask((prev) => [...prev]);
              }}
              >
              <img src={mask[y*size+x] !== blockStates.visible ? mask[y*size+x] : imagesField.get(field[y*size+x])}/>
              </div>);
          })}
        </div>
        );
      })
    }
    </div>
    <p className="description">Двойной клик по клетке - старт игры</p>
  </div>
    );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);