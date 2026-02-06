import {get_card_prng, getRandomInteger} from "./random_functions.js";
console.log("Generate text")
const NGRAM = 2
const MAX_SENTENCE_WORDS = 40
const MIN_SENTENCE_WORDS = 4
const TARGET_SENTENCES_MIN = 2
const TARGET_SENTENCES_MAX = 4
const MAX_RETRIES = 5

async function get_file(filename) {
  let sample_json = null;
  await fetch(filename).then((res) => res.json()).then((json)=> sample_json=json);
  return sample_json;
}

function tupleKey(array) {
  return `(${array.map(v => `'${v}'`).join(", ")})`
}

function keyToArray(tuple) {
    return tuple
    .slice(1, -1)            // remove ( )
    .split(", ")
    .map(s => s.slice(1, -1)) // remove quotes
}

function random_choice(array, prng){
  if (array === null) {
    return null;
  }
  let len = array.length
  if (len == 0) {
    return null;
  }
  const rand_float = prng();
  const pos = getRandomInteger(rand_float, 0, len);
  return array[pos];
}

function find_overlap(start_word, starts, model) {
    let possible_starts = []
    const lower_word = start_word.toLowerCase()
    for (const k of starts){
        let k_array = keyToArray(k)
        if (lower_word == k_array[0].toLowerCase() || lower_word == k_array[1].toLowerCase()){
            possible_starts.push(k_array)
        }
    }
    // Fall back to searching all model keys if no overlap in _starts
    if (possible_starts.length === 0) {
        for (const k in model){
            if (k === "_starts") continue;
            let k_array = keyToArray(k)
            if (lower_word == k_array[0].toLowerCase() || lower_word == k_array[1].toLowerCase()){
                possible_starts.push(k_array)
            }
        }
    }
    console.log("len overlaps", possible_starts.length)
    return possible_starts;
}

function generate_sentence(model_data, start, prng){
  var output = [...start];
  for (let i = 0; i < MAX_SENTENCE_WORDS; i++) {
    let key = tupleKey(output.slice(-NGRAM));
    let next_item = random_choice(model_data[key] || null, prng)
    if (next_item === null){
      break;
    }
    output.push(next_item);
  }
  return output;
}

function isSemicolonList(sentence) {
  return (sentence.match(/;/g) || []).length >= 2;
}

function postprocess(text) {
  // Capitalize first character
  if (text.length > 0) {
    text = text[0].toUpperCase() + text.slice(1);
  }
  // Ensure ends with sentence-ending punctuation
  if (text.length > 0 && !text.match(/[.!?]$/)) {
    text = text + ".";
  }
  // Collapse double spaces
  text = text.replace(/  +/g, " ");
  return text;
}

export function generate_explanation(markov_data, prompt_answer, title, card_position, pageState){
  pageState = pageState || { listUsed: false };
  const prng = get_card_prng(prompt_answer, card_position);
  const starts = markov_data["_starts"] || [];
  const possible_starts = find_overlap(title, starts, markov_data);

  // Decide how many sentences (2-4)
  const num_sentences = getRandomInteger(prng(), TARGET_SENTENCES_MIN, TARGET_SENTENCES_MAX + 1);
  const sentences = [];

  for (let s = 0; s < num_sentences; s++) {
    let sentence = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      // Pick a start: prefer overlap starts for the first sentence, otherwise use _starts
      let start;
      if (s === 0 && possible_starts.length > 0) {
        start = random_choice(possible_starts, prng);
      } else if (starts.length > 0) {
        start = keyToArray(random_choice(starts, prng));
      } else {
        // Fallback: random model key
        let keys = Object.keys(markov_data).filter(k => k !== "_starts");
        start = keyToArray(random_choice(keys, prng));
      }

      let words = generate_sentence(markov_data, start, prng);
      if (words.length < MIN_SENTENCE_WORDS) {
        continue;
      }
      let candidate = words.join(" ");
      if (isSemicolonList(candidate) && pageState.listUsed) {
        continue;
      }
      if (isSemicolonList(candidate)) {
        pageState.listUsed = true;
      }
      sentence = candidate;
      break;
    }
    if (sentence) {
      sentences.push(sentence);
    }
  }

  let text = sentences.join(" ");
  text = postprocess(text);
  console.log("Generated:", text);
  return text;
}

try {
  const markov_data = await get_file("./data/markov_v2.json")
  const text = generate_explanation(markov_data, "word", "hermit", 0);
} catch(err) {
  console.error("Error", err)
}
