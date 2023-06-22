import createElement from '../../helpers/domHelper';
import { createFighterImage } from '../fighterPreview';
import showModal from './modal';

// eslint-disable-next-line import/prefer-default-export
export function showWinnerModal(fighter) {
    // call showModal function
    showModal({
        title: 'YOU WIN!!!!!!',
        // eslint-disable-next-line no-use-before-define
        bodyElement: createBodyElement(fighter),
        onClose: () => {
            document.location.href = '/';
        }
    });
}

function createBodyElement(fighter) {
    const fighterElement = createElement({
        tagName: 'div',
        className: 'modal-card___winner'
    });

    fighterElement.appendChild(createFighterImage(fighter));
    fighterElement.innerHTML += `
        <h1>${fighter.name}</h1>
    `;

    return fighterElement;
}
