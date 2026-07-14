import type {
  MobiLevantamentoInputV1,
  ProjectMobiEnvelopeV1,
  ProjectMobiProducerPortV1,
} from "../../../platform-extensions/mobi-platform-chain-v1/src/index";

export class MobiLevantamentoProducer {
  constructor(private readonly producer: ProjectMobiProducerPortV1) {}
  generate(input: MobiLevantamentoInputV1): ProjectMobiEnvelopeV1 {
    return structuredClone(this.producer.produce(structuredClone(input)));
  }
}
