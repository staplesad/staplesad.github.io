import {get_bare_prng, getRandomInteger} from "./random_functions.js";
import {generate_explanation} from "./generate_text.js";
console.log("module start")
const url = "http://www.w3.org/2000/svg"
const center_size=11;
const landing_page_params = new URLSearchParams(window.location.search)
let prompt = landing_page_params.get("answer")
prompt = (prompt === null) ? "" : prompt;
console.log("answer", prompt)

function border(width, height, border_width, offset, dasharray, colour, rx=5){
  let elOutline = document.createElementNS(url, 'rect');
  elOutline.setAttribute('x', (offset+(border_width/2)));
  elOutline.setAttribute('y', (offset+(border_width/2)));
  elOutline.setAttribute('width', width -border_width-offset*2);
  elOutline.setAttribute('height', height -border_width-offset*2);
  elOutline.setAttribute('stroke-width', border_width);
  elOutline.setAttribute('rx', rx);
  if (dasharray) {
    elOutline.setAttribute("stroke-dasharray", dasharray);
  }
  if (colour) {
    elOutline.setAttribute("fill", "none");
    elOutline.setAttribute("stroke", colour);
  }
  return elOutline;
}

function center_image(width, height, prime_emoji){
  let elCenter = document.createElementNS(url, 'text');
  elCenter.innerHTML = prime_emoji;
  elCenter.setAttribute('x', width/2);
  elCenter.setAttribute('y', height/2);
  elCenter.setAttribute("fill", "black")
  elCenter.setAttribute("stroke", "none")
  elCenter.setAttribute('font-size', "" + center_size);
  elCenter.setAttribute('text-anchor', "middle");
  elCenter.setAttribute('dominant-baseline', "central");
  elCenter.setAttribute('transform', `translate(0 -${center_size/2})`);
  let elCenterUpsideDown = elCenter.cloneNode(true);
  elCenterUpsideDown.setAttribute('transform', `rotate(-180, ${width/2}, ${height/2}) translate(0 -${center_size/2})`);
  return [elCenter, elCenterUpsideDown];

}

function wiggleEmojis(width, height, emoji, scale, id){
  let defs = document.createElementNS(url, 'def');
  let path = document.createElementNS(url, 'path');
  const pathid = "wiggle_path"+id;
  path.setAttribute("id", pathid);
  const remaining_height = height - 2* (height/4)-2
  const segment_height = remaining_height / 5;
  const path_def = `M ${width/4} ${height/4 + 1}
    q -3.5 2, 0 ${segment_height}
    t 0 ${segment_height}
    t 0 ${segment_height}
    t 0 ${segment_height}
    t 0 ${segment_height}
    `
  path.setAttribute('d', path_def);
  let parentEl = document.createElementNS(url, 'text');
  parentEl.setAttribute('font-size', 1);
  if (scale){
    parentEl.setAttribute('transform-origin', 'center');
    parentEl.setAttribute('transform', scale);
  }
  let elPath = document.createElementNS(url, 'textPath');
  elPath.setAttribute('href', '#'+pathid);
  elPath.innerHTML =  emoji.repeat(50);
  elPath.setAttribute("fill", "black")
  elPath.setAttribute("stroke", "none")
  elPath.setAttribute("lengthAdjust", "spacingAndGlyphs");
  elPath.setAttribute("alignment-baseline", "text-before-edge");
  defs.appendChild(path);
  parentEl.appendChild(elPath);
  return [defs, parentEl];
}
function circleEmojis(width, height, emoji, rot, scale, id, r=2){
  let defs = document.createElementNS(url, 'def');
  let path = document.createElementNS(url, 'path');
  const pathid = "circle_path"+id;
  path.setAttribute("id", pathid);
  const path_def = `M ${width/4} ${height/5}
    m ${r}, 0
    a ${r},${r} 0 1,0 -${r * 2},0
    a ${r},${r} 0 1,0  ${r * 2},0
    `
  path.setAttribute('d', path_def);
  let parentEl = document.createElementNS(url, 'text');
  parentEl.setAttribute('font-size', 1);
  if (rot){
    parentEl.setAttribute('transform', `rotate(-${rot}, ${width/2}, ${height/2})`);
  }
  if (scale){
    parentEl.setAttribute('transform-origin', 'center');
    parentEl.setAttribute('transform', scale);
  }
  let elPath = document.createElementNS(url, 'textPath');
  elPath.setAttribute('href', '#'+pathid);
  elPath.innerHTML =  emoji.repeat(20);
  elPath.setAttribute("fill", "black")
  elPath.setAttribute("stroke", "none")
  elPath.setAttribute("lengthAdjust", "spacingAndGlyphs")
  defs.appendChild(path);
  parentEl.appendChild(elPath);
  return [defs, parentEl];
}

function backdrop(width, height, stroke_colour, fill, stroke_width, rx=1.25, ry=1.3){
    let centerBackdrop = document.createElementNS(url, 'ellipse')
    centerBackdrop.setAttribute("cx", width/2);
    centerBackdrop.setAttribute("cy", height/2);
    centerBackdrop.setAttribute("ry", center_size* ry);
    centerBackdrop.setAttribute("rx", center_size/rx);
    centerBackdrop.setAttribute("stroke", stroke_colour);
    centerBackdrop.setAttribute("fill", fill);
    if (stroke_width){
      centerBackdrop.setAttribute("stroke-width", stroke_width);
    }
    return centerBackdrop;
}

function createSVG(el, title_text, prime_emoji, decorative_emojis, flipped=false){
  let titleEl = document.createElementNS(url, 'text');
  const width=24;
  const height=width*1.5;

  el.setAttribute('fill', 'none');
  el.setAttribute('viewBox', '0 0 ' +width + ' ' +height);
  el.setAttribute('stroke', 'black');
  el.classList.add(prime_emoji);

  titleEl.innerHTML = title_text;
  titleEl.setAttribute('x', width/2);
  titleEl.setAttribute('y', 4);
  titleEl.setAttribute('text-anchor', "middle")
  titleEl.setAttribute('font-size', center_size/7.5);
  titleEl.setAttribute('stroke-width', 0.04);
  titleEl.setAttribute('fill', 'black');
  titleEl.setAttribute('font-family', 'Monoton');
  if (flipped){
    titleEl.setAttribute('transform', `rotate(-180, ${width/2}, ${height/2})`);
  }
  console.log(title_text);

  const elOutline1 = border(width, height, 1, 0, null, null);
  const elOutline4 = border(width, height, 0.05, 1.25, null, null, 4.5);
  const elOutline5 = border(width, height, 0.05, 1.45, null, null, 4.5);
  const elOutline6 = border(width, height, 0.05, 1.65, null, null, 4.5);
  const elOutline2 = border(width, height, 0.15, 2.25, "0.75,0.25", "#D3D3D3", 4);
  const elOutline3 = border(width, height, 0.25, 0.5, null, "white");
  const elOutline7 = border(width, height, 0.05, 0.1, null, "white", 5.5);

  let centerEls = center_image(width, height, prime_emoji);

  const centerBackdrop = backdrop(width, height, "#D3D3D3", "#D3D3D3", null);
  const centerBackdrop2 = backdrop(width, height, "white", "none", 0.25, 1.35, 1.2);
  const centerBackdrop3 = backdrop(width, height, "white", "none", 0.25, 1.5, 1.1);
  const centerBackdrop4 = backdrop(width, height, "white", "none", 0.25, 2, 0.9);
  let centerBackdrop5 = backdrop(width, height, "gray", "gray", null, 3.8, 0.35);
  centerBackdrop5.setAttribute("stroke-opacity", "0.5");
  centerBackdrop5.setAttribute("fill-opacity", "0.5");

  el.appendChild(elOutline1);
  el.appendChild(elOutline2);
  el.appendChild(elOutline3);
  el.appendChild(elOutline4);
  el.appendChild(elOutline5);
  el.appendChild(elOutline6);
  el.appendChild(elOutline7);
  el.appendChild(centerBackdrop);
  el.appendChild(centerBackdrop2);
  el.appendChild(centerBackdrop3);
  el.appendChild(centerBackdrop4);
  el.appendChild(centerBackdrop5);
  el.appendChild(centerEls[0]);
  el.appendChild(centerEls[1]);
  if (decorative_emojis.length > 0){
    let extraEl = circleEmojis(width, height, decorative_emojis[0], null, null, 1);
    el.append(extraEl[0]);
    el.appendChild(extraEl[1]);
    extraEl = circleEmojis(width, height, decorative_emojis[0], 180, null, 2);
    el.append(extraEl[0]);
    el.appendChild(extraEl[1]);
    extraEl = circleEmojis(width, height, decorative_emojis[0], null, "scale(1, -1)", 3);
    el.append(extraEl[0]);
    el.appendChild(extraEl[1]);
    extraEl = circleEmojis(width, height, decorative_emojis[0], null, "scale(-1, 1)", 4);
    el.append(extraEl[0]);
    el.appendChild(extraEl[1]);
    console.log(extraEl);
  }
  if (decorative_emojis.length > 1){
    let extraEl = wiggleEmojis(width, height, decorative_emojis[1], null, 1);
    el.append(extraEl[0]);
    el.appendChild(extraEl[1]);
    extraEl = wiggleEmojis(width, height, decorative_emojis[1], "scale(-1, 1)", 2);
    el.append(extraEl[0]);
    el.appendChild(extraEl[1]);
  }
  el.appendChild(titleEl);
  return el;
}

function assign_svg(card_node, title_text, prime_emoji, other_emojis){
  let card_svg = card_node.children[1];
  card_svg = createSVG(card_svg, title_text, prime_emoji, other_emojis);
}
function assign_explanation(card_node, text){
  let card_para = card_node.children[0];
  let text_node = document.createTextNode(text);
  card_para.appendChild(text_node);
}

function toggle_visibility(){
  let button = document.getElementsByTagName("button")[0];
  let titles = document.getElementsByClassName("explanation")[0];
  let table = titles.parentNode;
  table.classList.toggle("explain");
  if (button.innerText == "Explain") {
    button.innerText = "Just Cards";
  }
  else {
    button.innerText = "Explain";
  }
}

window.toggle_visibility = toggle_visibility;


function select_3_integers(prompt_answer, n_choices){
  const prng = get_bare_prng(prompt_answer);
  let rand_float = prng();
  const n1_choice = getRandomInteger(rand_float, 0, n_choices);
  rand_float = prng();
  let n2_choice = getRandomInteger(rand_float, 0, n_choices);
  while (n1_choice === n2_choice){
    rand_float = prng();
    n2_choice = getRandomInteger(rand_float, 0, n_choices);
  }
  rand_float = prng();
  let n3_choice = getRandomInteger(rand_float, 0, n_choices);
  while((n1_choice === n3_choice) || (n2_choice === n3_choice)){
    rand_float = prng();
    n3_choice = getRandomInteger(rand_float, 0, n_choices);
  }
  return [n1_choice, n2_choice, n3_choice];
};

function select_cards(prompt_answer){
  const n_cards = 22; // major arcana only?
  return select_3_integers(prompt_answer, n_cards)
}

function select_emojis(prompt_answer, emoji_list){
  const n_emojis = emoji_list.length
  let emoji_choices = select_3_integers(prompt_answer, n_emojis)
  return [emoji_list[emoji_choices[0]], emoji_list[emoji_choices[1]], emoji_list[emoji_choices[2]]]
}


async function get_file(filename) {
  let sample_json = null;
  await fetch(filename).then((res) => res.json()).then((json)=> sample_json=json);
  return sample_json;
}

async function get_emoji_data(){
  return get_file("./data/emoji_dict.json");
}

async function get_tarot_data(){
  return get_file("./data/tarot_interpretations.json")
}


function title_to_start(title){
  const components = title.split(" ");
  const start_word = components.slice(-1);
  console.log(start_word);
  return start_word[0];
}
try {
  const emoji_data = await get_emoji_data();
  console.log("✅ emoji_data:", emoji_data);

  const tarot_data = await get_tarot_data();
  console.log("✅ tarot_data:", tarot_data);

  const markov_data = await get_file("./data/markov_v2.json");
  console.log("✅ markov_data:",markov_data.length);

  const card_spread = select_cards(prompt)
  console.log("Card spread length:", card_spread.length);

  // loop through card spread and create elements
  const pageState = { listUsed: false };
  for (let card=0; card<3; card++) {
    let card_node = document.getElementById("card"+(card+1))
    console.log(card_node)
    console.log(card_spread[card])
    const title = tarot_data["tarot_interpretations"][card_spread[card]]["name"]
    let emojis = select_emojis(prompt, emoji_data[title])
    console.log(title)
    console.log(emojis)
    assign_svg(card_node, title, emojis[0], emojis.slice(1, 3));
    console.log(prompt);
    const text = generate_explanation(markov_data, prompt, title_to_start(title),  card, pageState);
    assign_explanation(card_node, text);
  }

} catch(err) {
  console.error("❌ Error loading data:", err);
}
