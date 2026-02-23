import React, { useState, useCallback } from 'react';
import type { GameTheme } from '../../types';
import { ActionButton } from '../../components';

interface StoryNode {
  id: string;
  speaker?: string;
  portrait?: string;
  text: string;
  bg?: string;
  choices?: { text: string; next: string; condition?: (vars: Record<string, number>) => boolean }[];
  next?: string;
  setVar?: { key: string; value: number };
  ending?: string;
}

const STORY: Record<string, StoryNode> = {
  start: {
    id: 'start', speaker: 'Narrator', portrait: '🌅',
    text: 'You stand at the entrance of an ancient library. Dust motes float in shafts of golden light. Two corridors stretch before you.',
    bg: '🏛️',
    choices: [
      { text: 'Take the left corridor (dusty, old books)', next: 'left_corridor' },
      { text: 'Take the right corridor (well-lit, modern)', next: 'right_corridor' },
      { text: 'Examine the entrance hall', next: 'entrance_hall' },
    ],
  },
  entrance_hall: {
    id: 'entrance_hall', speaker: 'Narrator', portrait: '🔍',
    text: 'You notice a small journal on the welcome desk. Inside, a note reads: "The truth lies in the oldest section." A key falls from the pages.',
    setVar: { key: 'has_key', value: 1 },
    next: 'start',
  },
  left_corridor: {
    id: 'left_corridor', speaker: 'Narrator', portrait: '📚',
    text: 'The left corridor is lined with ancient tomes. The air smells of parchment and time. At the end, you find a locked door and a mysterious figure reading by candlelight.',
    choices: [
      { text: 'Speak to the figure', next: 'meet_scholar' },
      { text: 'Try the locked door', next: 'locked_door' },
    ],
  },
  right_corridor: {
    id: 'right_corridor', speaker: 'Narrator', portrait: '💡',
    text: 'The right corridor opens into a modern reading room. Comfortable chairs, bright lights, and a digital catalog terminal. A librarian waves you over.',
    choices: [
      { text: 'Talk to the librarian', next: 'meet_librarian' },
      { text: 'Use the catalog terminal', next: 'catalog' },
    ],
  },
  meet_scholar: {
    id: 'meet_scholar', speaker: 'The Scholar', portrait: '🧙',
    text: '"Ah, another seeker. I have spent decades searching for the Library\'s greatest secret. Help me, and I will share what I have learned."',
    choices: [
      { text: '"I\'d be happy to help."', next: 'help_scholar' },
      { text: '"What\'s in it for me?"', next: 'negotiate_scholar' },
    ],
  },
  help_scholar: {
    id: 'help_scholar', speaker: 'The Scholar', portrait: '🧙',
    text: '"Excellent! I need three volumes from different sections. But beware — the Library has its own guardians."',
    setVar: { key: 'scholar_quest', value: 1 },
    next: 'scholar_quest_start',
  },
  negotiate_scholar: {
    id: 'negotiate_scholar', speaker: 'The Scholar', portrait: '🧙',
    text: '"A pragmatist, I see. Very well — the secret grants the reader any knowledge they desire. Is that not reward enough?"',
    next: 'help_scholar',
  },
  locked_door: {
    id: 'locked_door', speaker: 'Narrator', portrait: '🚪',
    text: 'The door is old and heavy, with an ornate keyhole.',
    choices: [
      { text: 'Use the key', next: 'secret_room', condition: (v) => (v.has_key ?? 0) > 0 },
      { text: 'Go back', next: 'left_corridor' },
    ],
  },
  secret_room: {
    id: 'secret_room', speaker: 'Narrator', portrait: '✨',
    text: 'The key fits perfectly. Inside, you find the Library\'s greatest treasure — a book that writes itself, containing the story of every visitor who has ever entered.',
    ending: 'The Secret Keeper',
  },
  meet_librarian: {
    id: 'meet_librarian', speaker: 'Librarian', portrait: '👩‍💼',
    text: '"Welcome! We don\'t get many visitors these days. Are you looking for something specific, or just exploring?"',
    choices: [
      { text: '"I\'m looking for a secret."', next: 'librarian_secret' },
      { text: '"Just browsing, thanks."', next: 'catalog' },
    ],
  },
  librarian_secret: {
    id: 'librarian_secret', speaker: 'Librarian', portrait: '👩‍💼',
    text: '"A secret? Well... there is an old legend about this library. They say the oldest book here contains the answer to any question. But you\'d need to find the old section."',
    next: 'left_corridor',
  },
  catalog: {
    id: 'catalog', speaker: 'Narrator', portrait: '💻',
    text: 'The catalog terminal hums to life. It shows thousands of entries. One category catches your eye: "Restricted — Founders\' Collection."',
    choices: [
      { text: 'Search "Founders\' Collection"', next: 'founders_ending' },
      { text: 'Go explore the old section', next: 'left_corridor' },
    ],
  },
  founders_ending: {
    id: 'founders_ending', speaker: 'Narrator', portrait: '📜',
    text: 'The terminal reveals that the Founders\' Collection is not a physical location — it\'s a state of mind. As you read, the library itself seems to whisper its secrets to you. You have become part of the Library.',
    ending: 'The Enlightened Reader',
  },
  scholar_quest_start: {
    id: 'scholar_quest_start', speaker: 'The Scholar', portrait: '🧙',
    text: '"The first volume is in the east wing. Be careful — the shelves shift when no one watches."',
    choices: [
      { text: 'Head to the east wing', next: 'scholar_ending' },
      { text: 'Explore on your own instead', next: 'right_corridor' },
    ],
  },
  scholar_ending: {
    id: 'scholar_ending', speaker: 'The Scholar', portrait: '🧙',
    text: 'Together, you and the Scholar piece together the ancient knowledge. The Library reveals itself to be alive — a sentient archive of all human wisdom. You become its newest librarian.',
    ending: 'The New Librarian',
  },
};

export default function VisualNovelGame({ theme }: { theme: GameTheme }) {
  const [currentNode, setCurrentNode] = useState('start');
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [textRevealed, setTextRevealed] = useState(true);

  const node = STORY[currentNode];

  const goTo = useCallback((nodeId: string) => {
    const target = STORY[nodeId];
    if (target?.setVar) {
      setVariables(prev => ({ ...prev, [target.setVar!.key]: target.setVar!.value }));
    }
    setHistory(prev => [...prev, currentNode]);
    setCurrentNode(nodeId);
    setTextRevealed(false);
    setTimeout(() => setTextRevealed(true), 50);
  }, [currentNode]);

  const restart = useCallback(() => {
    setCurrentNode('start');
    setVariables({});
    setHistory([]);
  }, []);

  if (!node) return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Story error</div>;

  const availableChoices = node.choices?.filter(c => !c.condition || c.condition(variables));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Scene background */}
      <div className="flex-1 flex items-end justify-center p-4" style={{ minHeight: '50vh' }}>
        <div className="text-8xl opacity-20 select-none">{node.bg ?? node.portrait}</div>
      </div>

      {/* Dialogue box */}
      <div className="bg-surface border-t border-border p-6 max-w-3xl mx-auto w-full">
        {node.speaker && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{node.portrait}</span>
            <span className="font-bold text-primary text-sm uppercase tracking-wide">{node.speaker}</span>
          </div>
        )}

        <p className={`text-lg leading-relaxed mb-6 transition-opacity duration-300 ${textRevealed ? 'opacity-100' : 'opacity-0'}`}>
          {node.text}
        </p>

        {node.ending ? (
          <div className="text-center">
            <div className="text-accent text-sm font-bold mb-2 uppercase tracking-wide">Ending Reached</div>
            <div className="text-xl font-bold mb-4">{node.ending}</div>
            <ActionButton label="Start Over" onClick={restart} variant="primary" />
          </div>
        ) : node.next && !node.choices ? (
          <ActionButton label="Continue" onClick={() => goTo(node.next!)} variant="primary" fullWidth />
        ) : (
          <div className="space-y-2">
            {availableChoices?.map((choice, i) => (
              <button
                key={i}
                onClick={() => goTo(choice.next)}
                className="w-full text-left p-3 bg-surface-alt border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <span className="text-sm">{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-surface/50 border-t border-border px-4 py-2 flex justify-between items-center">
        <button
          onClick={() => {
            if (history.length > 0) {
              const prev = history[history.length - 1];
              setHistory(h => h.slice(0, -1));
              setCurrentNode(prev);
            }
          }}
          disabled={history.length === 0}
          className="text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        <span className="text-xs text-muted">
          {history.length} steps
        </span>
        <button onClick={restart} className="text-xs text-muted hover:text-foreground transition-colors">
          Restart
        </button>
      </div>
    </div>
  );
}
