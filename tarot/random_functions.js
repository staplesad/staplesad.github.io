function splitmix32(a) {
//https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
          t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}


function  hash(string, modulo_n) {
    let h = 0;
    for (let i =0; i < string.length; i++){
        h = (h*33) ^ string.charCodeAt(i);
    }
    return h % modulo_n;
}

export function get_bare_prng(prompt_answer){
  return splitmix32(hash(prompt_answer, 0xffffffff));
}

export function get_card_prng(prompt_answer, position){
  const seed_str = `${prompt_answer}|${position}`;
  return splitmix32(hash(seed_str, 0xffffffff));
}

export const getRandomInteger = (rand_float, min, max) => {
  return Math.floor(rand_float * (max-min)) + min;
}
