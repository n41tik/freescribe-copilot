export async function saveNotesHistory(note) {
  let notes_history = await getHistory();

  let new_note = {
    time: new Date().toString(),
    note: note,
  };

  chrome.storage.sync.set(
    { notes_history: [new_note, ...notes_history] },
    function () {
      console.log("notes history saved");
    }
  );
}

export async function getHistory() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["notes_history"], function (result) {
      resolve(result.notes_history || []);
    });
  });
}
