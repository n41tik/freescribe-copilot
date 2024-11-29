import {getHistory} from "../src/history";


async function init(){
    toastr.options = {
        positionClass: "toast-bottom-center",
        showDuration: "300",
        hideDuration: "1000",
        timeOut: "5000",
        extendedTimeOut: "1000",
    };

    let notes_history = await getHistory();

    const accordionId = "historyAccordion";

    let html = ``;

    for (let index = 0; index < notes_history.length; index++) {
        const historyAccordion = notes_history[index];

        let dateTime = new Date(historyAccordion.time).toLocaleString();

        html += `<div class="accordion-item">
                <h2 class="accordion-header">
                  <buttonn class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#historyAccordion${index}" aria-expanded="false" aria-controls="historyAccordion${index}"
                  >${dateTime}</button>
                </h2>
                <div id="historyAccordion${index}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                  <div class="accordion-body">
                    <button data-copy-id="history-note-${index}" type="button" class="btn btn-sm btn-secondary copy-history-btn">
                      <i class="fas fa-copy"></i> Copy Notes
                    </button>
                    <pre class="history-notes" id="history-note-${index}">${historyAccordion.note}</pre>
                  </div>
                </div>
              </div>`;
    }

    document.getElementById(accordionId).innerHTML = html;

    let copyHistoryButton = document.getElementsByClassName("copy-history-btn");

    function copyHistory(event) {
        let historyNotesId = event.currentTarget.getAttribute("data-copy-id");

        navigator.clipboard
            .writeText(document.getElementById(historyNotesId).textContent)
            .then(() => {
                toastr.info(`history notes copied to clipboard!`);
            })
            .catch((err) => {
                toastr.info(`Failed to copy history notes. Please try again.`);
            });

    }

    for (let index = 0; index < copyHistoryButton.length; index++) {
        copyHistoryButton[index].addEventListener("click", copyHistory);
    }
}

init();