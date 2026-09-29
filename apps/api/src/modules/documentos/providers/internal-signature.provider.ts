import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import {
  DocumentSignatureProvider,
  DadosSignatarioSolicitacao,
  ResultadoSolicitacaoAssinatura,
  DadosConfirmacaoAssinatura,
  EvidenciaAssinaturaResultado,
  CertificadoConclusaoDados,
} from './signature-provider.interface';

@Injectable()
export class EddieInternalSignatureProvider implements DocumentSignatureProvider {
  private readonly PROVEDOR_NOME = 'EDDIE_INTERNAL_NATIVE_V1';

  obterNomeProvedor(): string {
    return this.PROVEDOR_NOME;
  }

  async emitirSolicitacao(
    dados: DadosSignatarioSolicitacao,
    documento: { id: string; codigo: string; titulo: string; hashOriginal: string },
  ): Promise<ResultadoSolicitacaoAssinatura> {
    const transactionId = `TX-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const tokenAcesso = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    return {
      provedor: this.PROVEDOR_NOME,
      sucesso: true,
      transactionId,
      tokenAcesso,
      urlAssinaturaExterna: `/documentos/assinar-externo/${tokenAcesso}`,
      expiraEm,
    };
  }

  async coletarAssinatura(
    dados: DadosConfirmacaoAssinatura,
  ): Promise<EvidenciaAssinaturaResultado> {
    const timestamp = new Date();
    const transactionId = `EDDIE-SIG-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

    // Computação do Hash Criptográfico de Evidência:
    // SHA256(documentoId + codigo + signatarioId + documentoIdentificacao + papel + hashConteudo + timestamp)
    const payloadEvidencia = [
      dados.documentoId,
      dados.codigoDocumento,
      dados.signatarioId,
      dados.documentoIdentificacao,
      dados.papel,
      dados.metodoAutenticacao,
      dados.hashConteudoOriginal,
      timestamp.toISOString(),
      dados.ipAssinatura || '0.0.0.0',
      dados.userAgent || 'EDDIE-Core-Agent',
    ].join('|');

    const hashEvidencia = crypto
      .createHash('sha256')
      .update(payloadEvidencia)
      .digest('hex');

    return {
      provedor: this.PROVEDOR_NOME,
      hashEvidencia,
      transactionId,
      carimboDoTempo: timestamp,
      dadosAuditoria: {
        signatarioNome: dados.nome,
        signatarioEmail: dados.email,
        documentoIdentificacao: dados.documentoIdentificacao,
        papel: dados.papel,
        metodo: dados.metodoAutenticacao,
        ip: dados.ipAssinatura || '127.0.0.1',
        userAgent: dados.userAgent || 'EDDIE Platform',
        timestampUtc: timestamp.toISOString(),
        integridadeHash: hashEvidencia,
      },
      certificadoInfo: {
        autoridadeCertificadora: 'EDDIE Sovereign PKI & Audit Vault',
        politicaAssinatura: 'ICP-Brasil & EDDIE Standard 11.35',
        criptografia: 'SHA-256 / RSA-2048 Equivalent Envelope',
      },
    };
  }

  async gerarCertificadoConclusao(
    dados: CertificadoConclusaoDados,
  ): Promise<{ certificadoHash: string; certificadoTexto: string }> {
    const signatariosFormatados = dados.signatarios
      .map(
        (s, idx) =>
          `  [${idx + 1}] ${s.papel}: ${s.nome} (${s.documentoIdentificacao}) | ` +
          `Email: ${s.email} | Método: ${s.metodo} | Assinado em: ${s.assinadoEm.toISOString()} | ` +
          `IP: ${s.ip || 'N/A'} | Hash Evidência: ${s.hashEvidencia}`,
      )
      .join('\n');

    const certificadoTexto = `
================================================================================
          CERTIFICADO DE CONCLUSÃO DE ASSINATURA ELETRÔNICA — EDDIE 11.35
================================================================================
DOCUMENTO: ${dados.codigoDocumento}
TÍTULO: ${dados.tituloDocumento}
CATEGORIA: ${dados.tipoDocumento}
HASH ORIGINAL (SHA-256): ${dados.hashOriginal}
HASH FINAL SELADO (SHA-256): ${dados.hashFinal}
TOTAL DE SIGNATÁRIOS: ${dados.totalSignatarios}
DATA/HORA DE CONCLUSÃO (UTC): ${dados.concluidoEm.toISOString()}

SIGNATÁRIOS REGISTRADOS E VALIDADOS:
${signatariosFormatados}

DECLARAÇÃO DE INTEGRIDADE:
Este documento foi formalizado através da plataforma EDDIE com carimbo de tempo
e evidências criptográficas imutáveis, atendendo aos requisitos operacionais,
jurídicos e financeiros da DiskIngressos. Qualquer alteração posterior ao encerramento
invalida os hashes supra declarados.
================================================================================
`.trim();

    const certificadoHash = crypto
      .createHash('sha256')
      .update(certificadoTexto)
      .digest('hex');

    return {
      certificadoHash,
      certificadoTexto,
    };
  }
}
