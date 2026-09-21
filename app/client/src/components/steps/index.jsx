import Story from "./Story";
import Teach from "./Teach";
import Pick from "./Pick";
import Listen from "./Listen";
import Build from "./Build";
import Translate from "./Translate";
import Match from "./Match";
import Speak from "./Speak";
import Chat from "./Chat";
import SoundMatch from "./SoundMatch";
import SceneTap from "./SceneTap";
import Keypad from "./Keypad";
import RaceTap from "./RaceTap";
import Hack from "./Hack";
import SpotMistake from "./SpotMistake";
import OddOneOut from "./OddOneOut";
import SpeakCards from "./SpeakCards";
import Dialogue from "./Dialogue";
import VoiceNote from "./VoiceNote";
/* B2 step types. The A1 mechanics above stay exactly as they are; these four
   exist because no A1 component does the job: a nine-minute sectioned player,
   a comprehension question against a source, an expression shown in the line it
   was said in, and free written production. */
import SourceAudio from "./SourceAudio";
import SourceQ from "./SourceQ";
import Chunk from "./Chunk";
import Produce from "./Produce";
import Converse from "./Converse";
import SourceText from "./SourceText";
import ReadTask from "./ReadTask";
import Notice from "./Notice";
import ChunkChoose from "./ChunkChoose";
import ChunkProduce from "./ChunkProduce";
import GContrast from "./GContrast";
import GForm from "./GForm";
import GUse from "./GUse";
import Write from "./Write";
import HoerenTeil1 from "./HoerenTeil1";

const COMPONENTS = {
  story: Story, teach: Teach, pick: Pick, listen: Listen, build: Build, translate: Translate,
  match: Match, speak: Speak, chat: Chat,
  soundmatch: SoundMatch, scenetap: SceneTap, keypad: Keypad, race: RaceTap, hack: Hack,
  spotmistake: SpotMistake, oddoneout: OddOneOut, speakcards: SpeakCards, dialogue: Dialogue,
  voicenote: VoiceNote,
  listen_source: SourceAudio, sourceq: SourceQ, chunk: Chunk, produce: Produce,
  converse: Converse,
  read_source: SourceText, readq: ReadTask,
  notice: Notice, chunk_choose: ChunkChoose, chunk_produce: ChunkProduce,
  gcontrast: GContrast, gform: GForm, guse: GUse, write: Write,
  hoeren_t1: HoerenTeil1,
};

export default function StepBody({ step, ctx }) {
  const C = COMPONENTS[step.t];
  if (!C) return null;
  return <C step={step} ctx={ctx} />;
}
