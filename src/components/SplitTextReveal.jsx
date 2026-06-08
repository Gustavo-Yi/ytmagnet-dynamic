import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(GSAPSplitText, useGSAP);

function areFontsReady() {
  return typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded';
}

function useFontsReady(text) {
  const [fontsReady, setFontsReady] = useState(() => areFontsReady());

  useEffect(() => {
    let mounted = true;

    if (typeof document === 'undefined' || !document.fonts) {
      queueMicrotask(() => {
        if (mounted) setFontsReady(true);
      });
      return undefined;
    }

    if (document.fonts.status === 'loaded') {
      queueMicrotask(() => {
        if (mounted) setFontsReady(true);
      });
      return undefined;
    }

    document.fonts.ready.then(() => {
      if (mounted) setFontsReady(true);
    });

    return () => {
      mounted = false;
    };
  }, [text]);

  return fontsReady;
}

function getAnimationTargets(split, splitType) {
  if (splitType.includes('chars') && split.chars?.length) return split.chars;
  if (splitType.includes('words') && split.words?.length) return split.words;
  if (split.lines?.length) return split.lines;
  return [];
}

export default function SplitTextReveal({
  as = 'span',
  text,
  className = '',
  splitType = 'chars',
  delay = 18,
  startDelay = 0,
  duration = 0.86,
  ease = 'power3.out',
  fromOpacity = 0,
  fromY = 34,
  toOpacity = 1,
  toY = 0,
  onAnimationComplete,
  ...rest
}) {
  const elementRef = useRef(null);
  const splitRef = useRef(null);
  const fontsReady = useFontsReady(text);
  const Component = as;

  useGSAP(
    () => {
      const element = elementRef.current;
      if (!element || !text || !fontsReady) return undefined;

      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }

      element.textContent = text;

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      const split = GSAPSplitText.create(element, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType.includes('lines'),
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
      });
      splitRef.current = split;

      const targets = getAnimationTargets(split, splitType);
      if (!targets.length) return undefined;

      const tween = gsap.fromTo(
        targets,
        {
          opacity: fromOpacity,
          y: reduceMotion ? Math.min(fromY, 22) : fromY,
        },
        {
          opacity: toOpacity,
          y: toY,
          delay: startDelay,
          duration: reduceMotion ? Math.min(duration, 0.75) : duration,
          ease,
          stagger: (reduceMotion ? Math.min(delay, 14) : delay) / 1000,
          force3D: true,
          willChange: 'transform, opacity',
          clearProps: 'transform,opacity,willChange',
          onComplete: onAnimationComplete,
        },
      );

      return () => {
        tween.kill();
        if (splitRef.current === split) {
          split.revert();
          splitRef.current = null;
        }
      };
    },
    {
      scope: elementRef,
      dependencies: [
        text,
        fontsReady,
        splitType,
        delay,
        startDelay,
        duration,
        ease,
        fromOpacity,
        fromY,
        toOpacity,
        toY,
      ],
    },
  );

  const classes = ['split-text-reveal', className].filter(Boolean).join(' ');

  return (
    <Component ref={elementRef} className={classes} {...rest}>
      {text}
    </Component>
  );
}
