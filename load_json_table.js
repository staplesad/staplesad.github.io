function load_json(file){
  return fetch(file).then((response) => response.json())
}

function tableCreate(data) {
  const div = document.getElementById("ev_table"),
  tbl = document.createElement('table');
  tbl.style.width = '100px';

  for (const [name, ev] of Object.entries(data)) {
    const tr = tbl.insertRow();
    for (let j = 0; j < 2; j++) {
      const td = tr.insertCell();
      let value = ""
      if (j===0) {
        console.log("if")
        value = name
      }
      else {
        console.log("else")
        value = ev
      }
      td.appendChild(document.createTextNode(`${value}\t\t`));
    }
  }
  div.appendChild(tbl);
}

data = load_json("./ev_table.json")
data.then((a) => tableCreate(a))
