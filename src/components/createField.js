
// constructing a field with mines
export function createField(size,bombs, xN, yN){
  const mine=-1;
  const field = new Array(size*size).fill(0);

  function createNumberAround(x,y){
    if (x>=0 && y>=0 && x<size && y<size){
      if (field[y*size+x]==mine) return;
      field[y*size+x]+=1;
    }
  }

  for (let i=0; i<bombs;){
    const x=Math.floor(Math.random()*size);
    const y=Math.floor(Math.random()*size);
    const checkField = (x>=xN-1 && x<=xN+1 && y>=yN-1 && y<=yN+1);

    if (field[y*size+x]==mine || checkField) continue;

    field[y*size+x]=mine;
    i+=1;

    createNumberAround(x+1,y);
    createNumberAround(x-1,y);
    createNumberAround(x,y+1);
    createNumberAround(x,y-1);
    createNumberAround(x+1,y+1);
    createNumberAround(x-1,y+1);
    createNumberAround(x+1,y-1);
    createNumberAround(x-1,y-1);
  }
  return field;
}