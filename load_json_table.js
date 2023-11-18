function load_json(file){
  return fetch(file).then((response) => response.json())
}

function get_pdb_url(name){
  base_url = "https://pokemondb.net/pokedex/"
  return base_url + name
}
function tableCreate(data) {
  const div = document.getElementById("ev_table"),
  tbl = document.createElement('table');
  tbl.style.width = '100px';

  names = Object.keys(data);
  names.sort();
  for (let i=0; i< names.length; i++) {
    key = names[i]
    n = names[i][0].toUpperCase() + names[i].slice(1);
    ev = data[key];
    const tr = tbl.insertRow();
    for (let j = 0; j < 2; j++) {
      const td = tr.insertCell();
      if (j===0) {
        link = document.createElement('a');
        link.href = get_pdb_url(key);
        textnode = document.createTextNode(`${n}\t\t`);
        link.appendChild(textnode);
        td.appendChild(link);
      }
      else {
        td.appendChild(document.createTextNode(`${ev}\t\t`));
      }
    }
  }
  div.appendChild(tbl);
}

data = load_json("./ev_table.json")
data.then((json) => tableCreate(json))
