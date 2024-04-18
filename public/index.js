document.addEventListener('DOMContentLoaded', function () {
    // hääletuse vastus headerisse
    fetch('/get-vote')
        .then(response => {
            if (!response.ok) throw new Error('No valid vote in current session');
            return response.json();
        })
        .then(data => {
            const voteStatusElement = document.getElementById('voteStatus');
            let iconHTML = '';
            switch (data.vote) {
                case 'Poolt':
                    iconHTML = '<i class="material-icons">check_circle</i>';
                    break;
                case 'Vastu':
                    iconHTML = '<i class="material-icons">do_not_disturb_on</i>';
                    break;
                default:
                    iconHTML = '<i class="material-icons">error</i>';
            }
            voteStatusElement.innerHTML = `${iconHTML} Otsus langetatud: ${data.vote.toUpperCase()}`;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('voteStatus').innerHTML = '<i class="material-icons">error</i> Otsus langetamata';
        });

    // eesnimi ja perenimi headerisse
    fetch('/get-username')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Isik tuvastamata');
        })
        .then(data => {
            document.getElementById('voter_name').textContent = data.name;
        })
        .catch(error => {
            document.getElementById('voter_name').textContent = 'Külaline';
        });

    // timer display
    const timerInterval = setInterval(function () {
        fetch('/timer')
            .then(response => response.json())
            .then(data => {
                if (data.timeLeft <= 0) {
                    document.getElementById('timer').textContent = "Hääletus on lõppenud.";
                    clearInterval(timerInterval);
                } else {
                    let minutes = Math.floor(data.timeLeft / 60000);
                    let seconds = ((data.timeLeft % 60000) / 1000).toFixed(0);
                    document.getElementById('timer').textContent = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
                }
            })
            .catch(error => console.error('Error:', error));
    }, 1000);

    // results display on the summary.html page
    fetch('/results')
        .then(response => response.json())
        .then(data => {
            document.getElementById('results').textContent = `Poolt: ${data.poolt} Vastu: ${data.vastu}`;
        })
        .catch(error => console.error('Error fetching results:', error));

});

// Poolt/vastu nuppude funktsionaalsus
function sendData() {
    var selectedVote = document.querySelector('input[name="vote"]:checked').value;
    fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: selectedVote }),
        credentials: 'include',
        redirect: 'follow'
    }).then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.text();
        }
    }).then(result => {
        if (result) {
            alert(result);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}