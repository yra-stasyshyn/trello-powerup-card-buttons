const customWebHook1 = async (id) => {
  fetch(`https://webhook.site/2ac11cd3-8a2e-4128-a803-b7236fc35c84?id=${id}`, {
    method: "POST"
  });
}

const assignCardToList = async (cardId, listId) => {
  const response = await fetch(`https://trello.com/1/cards/${cardId}?key=${trelloKey}&token=${trelloToken}&idList=${listId}`, {
    method: "PUT"
  });

  return await response.json();
}

const addMemberToCard = async (cardId, memberId) => {
  const response = await fetch(`https://trello.com/1/cards/${cardId}/idMembers?key=${trelloKey}&token=${trelloToken}&value=${memberId}`, {
    method: "POST"
  });

  return await response.json();
}

const addLabelToCard = async (cardId, labelId) => {
  const response = await fetch(`https://trello.com/1/cards/${cardId}/idLabels?key=${trelloKey}&token=${trelloToken}&value=${labelId}`, {
    method: "POST"
  });

  return await response.json();
}

const removeLabelFromCard = async (cardId, labelId) => {
  const response = await fetch(`https://trello.com/1/cards/${cardId}/idLabels/${labelId}?key=${trelloKey}&token=${trelloToken}`, {
    method: "DELETE"
  });

  return await response.json();
}

TrelloPowerUp.initialize({
  'card-buttons': function (t) {
    return [
      {
        icon: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
        text: 'Complete',
        callback: async function () {
          const targetLabelName = "Done";
          const targetListName = "Design";

          const card = await t.card("id", "labels", "members", "desc");
          const cardId = card?.id;

          const board = await t.board("labels");
          const boardLabels = board?.labels;
          const doneLabelId = boardLabels.filter(label => label.name === targetLabelName)?.at(0)?.id;

          const member = await t.member("id");
          const memberId = member?.id;

          // find out target list id
          const lists = await t.lists("id", "name");
          const listId = lists.filter(list => list.name === targetListName)?.at(0)?.id;

          try {
            await customWebHook1(card.desc);
            await assignCardToList(cardId, listId);

            // remove all the origin labels except for the target label if it exists
            let isTargetLabelExists = false;
            card.labels.forEach(label => {
              if (label.name !== targetLabelName) {
                removeLabelFromCard(cardId, label.id);
              }
              else {
                isTargetLabelExists = true;
              }
            });
            if (!isTargetLabelExists) {
              await addLabelToCard(cardId, doneLabelId);
            }

            // add member to the card if doesn't exist
            let isYouExists = false;
            card.members.forEach(member => {
              if (member.id === memberId) {
                isYouExists = true;
              }
            });
            if (!isYouExists) {
              await addMemberToCard(cardId, memberId);
            }

            t.alert({
              message: "Status Updated :heavy_check_mark:",
              duration: 2
            });
          }
          catch (e) {
            console.error("Error: ", e);
            t.alert({
              message: "Could not connect, contact admin :X:",
              duration: 2
            });
          }
        }
      },
      {
        icon: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
        text: 'Second Button'
      }
    ];
  }
}, {
  appKey: trelloKey,
  appName: appName
});