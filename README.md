# How LLMs Actually Work

An interactive visual guide to the internals of large language models — from raw text to generated output, covering the transformer architecture, training, alignment, and inference optimizations.

**Live site:** https://babanomania.github.io/how-llms-actually-work/

## Credits

Based on the original essay by **0xkato**: [How LLMs Actually Work](https://www.0xkato.xyz/how-llms-actually-work/). This repo turns that written guide into an interactive visual experience.

## What's covered

**Part I — The Forward Pass**
1. Tokenization
2. Embeddings
3. Positional Encoding
4. Attention
5. Multi-Head Attention
6. Feed-Forward Network
7. Residual Stream
8. Next-Token Prediction
9. Full Architecture

**Part II — How Models Learn**
10. Training & Backprop
11. Scaling Laws

**Part III — Base → Assistant**
12. RLHF & Alignment
13. In-Context Learning

**Part IV — Running the Model**
14. Mixture of Experts
15. KV Cache & Inference
16. Quantization

**Part V — Limitations**
17. Why Hallucinations Happen

## Tech stack

- React 18
- Vite 5
- Tailwind CSS 3

## Local development

```bash
npm install
npm run dev
```

## Deployment

Automatically deployed to GitHub Pages on every push to `main` via GitHub Actions.

```bash
npm run build   # output goes to dist/
```
