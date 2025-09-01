import './style.css'
function translateDay(day) {
  const days = {
    'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié',
    'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb',
    'Sun': 'Dom',
  };
  return days[day] || day;
}

function reproductorGenerator(context, state) {
  
  const spanInput = document.createElement('span');
  Object.assign(spanInput.style, {
      position: 'absolute',
      left: '0%',
      top: '-30px',
      // transform: 'translateX(-50%)',
      textAlign: 'center',
      userSelect: 'none',
      background: 'rgba(255, 255, 255)',
      position: 'absolute',
      paddingLeft: '5px',
      paddingRight: '5px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      border: '1.5px solid rgb(118, 118, 118)',
  });

  function SetInputRangeLabel(frame) {
      let date = new Date(state.instance.split('_')[0]);
      date.setUTCMinutes(frame*context.ref_dt);
      if (context.optionLocalTime == true) {
        const localOffset = date.getTimezoneOffset();
        date = new Date(date - localOffset * 60 * 1000);
      }
      let day = translateDay(date.toUTCString().slice(0,3));
      spanInput.textContent = context.optionLocalTime == true
        ? day + ', ' + date.toUTCString().slice(5, 22)
        : day + ', ' + date.toUTCString().slice(5, 22) + ' UTC';
  }

  const inputFrame = document.createElement('input');
  inputFrame.id = 'time-selector';
  inputFrame.type  = 'range';
  inputFrame.step  = 1;
  inputFrame.min   = Math.floor(context.startHour * 60 / context.ref_dt);
  inputFrame.max   = Math.floor(context.endHour   * 60 / context.ref_dt);
  inputFrame.value = inputFrame.min
  Object.assign(inputFrame.style, {
      width: '100%',
      height: '100%',
      userSelect: 'none',
      cursor: 'pointer',
  });
  inputFrame.style.WebkitAppearance = 'none';
  inputFrame.style.background = 'silver'
  inputFrame.style.borderRadius = '5px';
  inputFrame.style.height = '80%';

  SetInputRangeLabel(inputFrame.min);

  inputFrame.addEventListener('change', (event) => {
      const frame = event.target.value;
      state.frame = frame;
      SetInputRangeLabel(frame);
  });
  inputFrame.addEventListener('input', (event) => {
      const frame = event.target.value;
      state.frame = frame;
      SetInputRangeLabel(frame);
  });
  state.addEventListener('change:instance', () => {
    SetInputRangeLabel(state.frame);
  });

  //// Animacion
  const framepersecond  = 23;
  const framesPerUpdate = Math.floor(1000 / framepersecond / 16.67); 

  let frameCount = 0;
  let animationId = null;
  
  function animateRange() {
    frameCount++;
    if (frameCount % framesPerUpdate === 0) {
      let currentValue = parseInt(inputFrame.value);
      if (currentValue < parseInt(inputFrame.max)) {
        inputFrame.value = currentValue + 1;
        inputFrame.dispatchEvent(new Event('change'));
      } else {
        cancelAnimationFrame(animationId);
        buttonPause.click();
        animationId = null;
        return;
      }
    }
    animationId = requestAnimationFrame(animateRange);
  }

  //// Botones
  const styleButton = {
      width: '25px',
      userSelect: 'none',
      cursor: 'pointer',
  }
  const buttonPlay = document.createElement('i');
  buttonPlay.classList.add('bi', 'bi-play');
  Object.assign(buttonPlay.style, styleButton);
  buttonPlay.addEventListener('click', () => {
    if (!animationId) {
      animationId = requestAnimationFrame(animateRange);
    }
  });
  const buttonPause = document.createElement('i');
  buttonPause.classList.add('bi', 'bi-pause');
  Object.assign(buttonPause.style, styleButton);
  buttonPause.addEventListener('click', () => {
      if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
      }
  });
  const buttonNext = document.createElement('i');
  buttonNext.classList.add('bi', 'bi-plus', 'icon-black');
  Object.assign(buttonNext.style, styleButton);
  buttonNext.addEventListener('click', () => {
      buttonPause.click();
      let currentValue = parseInt(inputFrame.value);
      if (currentValue < parseInt(inputFrame.max)) {
        inputFrame.value = currentValue + 1;
        inputFrame.dispatchEvent(new Event('change'));
      }
  });
  const buttonPrev = document.createElement('i');
  buttonPrev.classList.add('bi', 'bi-dash', 'icon-black');
  Object.assign(buttonPrev.style, styleButton);
  buttonPrev.addEventListener('click', () => {
      buttonPause.click();
      let currentValue = parseInt(inputFrame.value);
      if (currentValue > 0) {
        inputFrame.value = currentValue - 1;
        inputFrame.dispatchEvent(new Event('change'));
      }
  });

  //// Nivel de altura
  const labelLevel = document.createElement('label');
  labelLevel.htmlFor = 'level-selector';
  labelLevel.textContent = 'Nivel:';
  Object.assign(labelLevel.style, {
      width: '50px',
      userSelect: 'none',
      cursor: 'pointer',
      textAlign: 'center',
  });
  const inputLevel = document.createElement('input');
  inputLevel.id    = 'level-selector';
  inputLevel.type  = 'number';
  inputLevel.min   = '0';
  inputLevel.step  = '1';
  inputLevel.value = state.level;
  inputLevel.max   = context.levels;
  Object.assign(inputLevel.style, {
      width: '50px',
      height: '100%',
      userSelect: 'none',
      cursor: 'pointer',
      textAlign: 'center',
  });
  //Desactivar focus
  inputLevel.addEventListener('focus', (event) => {
      event.target.blur();
  });
  inputLevel.addEventListener('change', (event) => {
      const level = parseInt(event.target.value);
      state.level = level;
  });

  //// Contenedor del reproductor
  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
      position: 'relative',
      height: '25px',
      display: 'flex',
      flexDirection: 'row',
      gap: '1px',
      alignItems: 'center',
      padding: '2px',
      background: 'rgba(255, 255, 255)',
      borderRadius: '5px',
      border: '1.5px solid rgb(118, 118, 118)',
      userSelect: 'none',
  });
  wrapper.appendChild(buttonPlay);
  wrapper.appendChild(buttonPause);
  wrapper.appendChild(buttonPrev);
  wrapper.appendChild(buttonNext);
  wrapper.appendChild(inputFrame);
  // wrapper.appendChild(labelLevel);
  // wrapper.appendChild(inputLevel);
  wrapper.appendChild(spanInput);

  // Alternar la visivilidad de los botones play and pause
  buttonPlay.style.display  = 'inline';
  buttonPause.style.display = 'none';
  buttonPlay.addEventListener('click', () => {
    buttonPlay.style.display  = 'none';
    buttonPause.style.display = 'inline';
  });
  buttonPause.addEventListener('click', () => {
    buttonPlay.style.display  = 'inline';
    buttonPause.style.display = 'none';
  });

  // // Update inputRange according to the selected domain
  // state.addEventListener('change:variable', (event) => {
  //   buttonPause.click();
  //   if (event.detail){
  //     const variableNew    = event.detail.newValue;
  //     const variableOld    = event.detail.oldValue;
  //     const inputMaxNew  = Math.floor(context.endHour * 60 / context.domains[variableNew].dt);
  //     const inputMaxOld  = Math.floor(context.endHour * 60 / context.domains[variableOld].dt);
  //     if (inputMaxOld != inputMaxNew) {
  //       // Update Value
  //       const currentSelectedFrame   = inputFrame.value;
  //       const percentageCurrentFrame = currentSelectedFrame / inputMaxOld;
  //       const newValue = Math.round(percentageCurrentFrame * inputMaxNew);
  //       inputFrame.min   = Math.floor(context.startHour * 60 / context.domains[variableNew].dt);
  //       inputFrame.max   = Math.floor(context.endHour   * 60 / context.domains[variableNew].dt);
  //       inputFrame.value = newValue;
  //       inputFrame.dispatchEvent(new Event('change'));
  //     }
  //   }
  // });


  // Generamos una pausa cuando se inicia la carga de datos
  let pauseLoad = false;
  document.addEventListener('loading:start', () => {
    if (animationId) {
      buttonPause.click();
      pauseLoad = true;
    }
  });
  document.addEventListener('loading:end', () => {
    if (pauseLoad) {
      pauseLoad = false;
      buttonPlay.click();
    }
  });
  document.addEventListener('loading2:start', () => {
    if (animationId) {
      buttonPause.click();
      pauseLoad = true;
    }
  });
  document.addEventListener('loading2:end', () => {
    if (pauseLoad) {
      pauseLoad = false;
      buttonPlay.click();
    }
  });
  
  return wrapper;
}


export { reproductorGenerator };