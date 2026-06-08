# How LLMs Actually Work

17 interactive sections that walk through how large language models work, from tokenization to hallucinations.

**Live site:** https://babanomania.github.io/how-llms-actually-work/

## Credits

Built on [0xkato's original essay](https://www.0xkato.xyz/how-llms-actually-work/) of the same name. This repo adds interactive visualizations to the same material.

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

Deployed to GitHub Pages on every push to `main` via GitHub Actions.

```bash
npm run build   # output goes to dist/
```
