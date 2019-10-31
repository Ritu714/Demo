// interactive presenter
AdobeEdge.bootstrapCallback(function(compId) {
  AdobeEdge.Symbol.bindElementAction(compId, 'stage', 'document', 'compositionReady', function(sym, e){

  if(typeof sym.presenter === 'undefined'){

    sym.presenter = {
      // types of questions to be displayed, uncomment one option as needed
      //type: 'double',
      //type: 'triple-vertical',
      type: 'triple-horizontal',
      // display left panel options panel
      optionOpen: false,
      // display bottom of screen playback bar options
      optionPlaybackOpen: false,
      // current question id
      curQuest: 0,
      // list of questions to be presented
      questions: 3,
      // video type
      vType: '',
      time: 0,
      // correct answers
      qAnswers: {
                  1:0,
                  2:2,
                  3:1
      },
      openPosOpts: [
        ['Welcome and Introduction', 12],
        ['Brainstorming', 101],
        ['The Purpose of the PSC Work Time Routine', 115],
        ['Providing Help to Students During the PSC Work Time', 243]
      ],
      backPosOpts: [
        ['A Look Inside a PSC Classroom',0],
        ['Follow-Up Analysis', 460],
        ['Reflection and Thank You', 600]
      ],
      mediaDir: 'media/',
      // start/end media
      staticContent: {
        front: 'FRONT',
        start: 'OPENING',
        back: 'BACK'
      },
      nextVideo: '',
      vidExt: '.mp4',
      status: '',
      keyIntFuncs: {},
      fileNameBld: function(type){
        var file = '';

        switch(type){
          case 'front':
            file = sym.presenter.mediaDir + sym.presenter.staticContent.front + '.mp4';
          break;
          case 'start':
            file = sym.presenter.mediaDir + sym.presenter.staticContent.start + sym.presenter.vidExt;
          break;
          case 'question':
            file = sym.presenter.mediaDir + 'QUESTION_' + sym.presenter.curQuest + sym.presenter.vidExt;
          break;
          case 'loop':
            file = sym.presenter.mediaDir + 'LOOP_' + sym.presenter.curQuest + sym.presenter.vidExt;
          break;
          case 'correct':
            file = sym.presenter.mediaDir + 'CORRECT_' + sym.presenter.curQuest + sym.presenter.vidExt;
          break;
          case 'wrong':
            file = sym.presenter.mediaDir + 'WRONG_' + sym.presenter.curQuest + sym.presenter.vidExt;
          break;
          case 'back':
            file = sym.presenter.mediaDir + sym.presenter.staticContent.back + '.mp4';
          break;
        }

        return file
      },
      playNext: function(type){
        var file = '';

        file = sym.presenter.fileNameBld(type);

        // store question type
        sym.presenter.vType = type;

        return file;
      },
      // show and hide interactive bits
      showInteract: function(){

        // disable key triggers
        document.removeEventListener('keydown', sym.presenter.keyIntFuncs);

        switch(sym.presenter.type){
          case 'double':
            sym.presenter.intOptsCnt = 2;
            sym.$('Shoulds').show();
          break;
          case 'triple-horizontal':
            sym.presenter.intOptsCnt = 3;
            sym.$('Horizontal').show();
          break;
          case 'triple-vertical':
            sym.presenter.intOptsCnt = 3;
            sym.$('Verticle').show();
          break;
        }

        // init keydown triggers
        sym.presenter.keyIntFuncs = function(event) {
          var keyLen = sym.presenter.intOptsCnt,
              initKey = 65,
              maxKey = initKey + keyLen,
              i = initKey,
              keySpread = 32,
              curId = 0;

          // walk through assigned keydown keys and actions
          for(i; i < maxKey; i++){
            // check upper/lower cases
            if(i === event.keyCode || (i+keySpread) === event.keyCode ){
              sym.presenter.checkAnswer(curId);
            }
            curId++;
          }

        };

        // enable new key triggers
        document.addEventListener('keydown', sym.presenter.keyIntFuncs);
      },
      // hide all interactive units
      hideInteract: function(){

        // disable key triggers
        document.removeEventListener('keydown', sym.presenter.keyIntFuncs);

        sym.$('reset').hide();
        sym.$('Verticle').hide();
        sym.$('Horizontal').hide();
        sym.$('Shoulds').hide();
      },
      loopQuestChk: function(ans){
        var video = '';

        switch(ans){
          case 0:
            video = sym.presenter.mediaDir + 'ANSWER_1' + sym.presenter.vidExt;
            sym.presenter.status = 'ANSWER_1';
            sym.presenter.hideInteract();
          break;
          case 1:
            video = sym.presenter.mediaDir + 'ANSWER_2' + sym.presenter.vidExt;
            sym.presenter.status = 'ANSWER_2';
            sym.presenter.hideInteract();
          break;
          case 2:
            video = sym.presenter.mediaDir + 'ANSWER_3' + sym.presenter.vidExt;
            sym.presenter.status = 'ANSWER_3';
            sym.presenter.hideInteract();
          break;
        }

        sym.$('reset').show();

        if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== video){
          sym.getSymbol('Video_Player').$('Video').attr('src',video);
        }
        sym.presenter.startPlayback();

      },
      // checks user answer submissions
      checkAnswer: function(ans){
        // custom answer check logic for triple vertical question type
        if(sym.presenter.type === 'triple-vertical'){

          sym.presenter.loopQuestChk(ans);

        // default answer check logic
        } else {
          if(sym.presenter.qAnswers[sym.presenter.curQuest] === ans){
            // load next question
            if(sym.presenter.curQuest <= sym.presenter.questions){
              sym.presenter.nextVideo = sym.presenter.playNext('correct');
              sym.presenter.curQuest += 1;
            }
          // load wrong answer video
          } else {
            // load wrong video
            sym.presenter.nextVideo = sym.presenter.playNext('wrong');
          }
          // hide user hot spots
          sym.presenter.hideInteract();
          // load video
          if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
            sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo);
          }
          sym.presenter.videoPlay();
        }
      },
      // video playback continuation
      videoCont: function(){

        // clear new video for loop
        if(sym.presenter.vType === 'loop'){
          sym.presenter.nextVideo = '';
        }

        // show interactive units
        if((sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.fileNameBld('front')
          || sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.fileNameBld('start'))
            && (sym.presenter.vType === 'question' || sym.presenter.vType === 'loop')){
          sym.presenter.showInteract();
        }

        // look for video has ended
        sym.$(sym.getSymbol('Video_Player').$('Video')[0]).bind('ended', function ()
        {
          // repeat current video
          if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] === sym.presenter.fileNameBld('back')){

            // stop playback
            sym.$(sym.getSymbol('Video_Player').$('Video')[0]).unbind('ended');

          } else if(sym.presenter.curQuest > 0 && (typeof sym.presenter.nextVideo === undefined || sym.presenter.nextVideo === '')){
            sym.getSymbol('Video_Player').$('Video')[0].play();

          // load next video
          } else {
            // remove end video end watcher
            sym.$(sym.getSymbol('Video_Player').$('Video')[0]).unbind('ended');

            // prevent loading of
            if(sym.presenter.curQuest === -1
                && sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] === sym.presenter.fileNameBld('front')){
              sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_A.png');
              sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');
              sym.presenter.nextVideo = sym.presenter.playNext('start');
              sym.presenter.curQuest += 1;
              sym.$('PlaybackHover').show();
              sym.$('Playback_Bar2').show();
              sym.getSymbol('Video_Player').$('Video')[0].controls = false;
              // hide ui
              sym.getSymbol('Playback_Bar2').$('back_btn').hide();
            } else if(sym.presenter.curQuest === 0
                && sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.fileNameBld('start')){
              sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_A.png');
              sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');
              sym.presenter.nextVideo = sym.presenter.playNext('start');
              sym.presenter.curQuest += 1;
            } else {

              // enable ui elms
              sym.getSymbol('Playback_Bar2').$('back_btn').show();

              // load question
              if(sym.presenter.curQuest === 0){
                sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_B.png');
                sym.$('background').css('background-image','url(images/BridgeIMG_B.png)');
                sym.presenter.curQuest += 1;
                sym.presenter.nextVideo = sym.presenter.playNext('question');
                sym.$('PlaybackHover').show();
                sym.$('Playback_Bar2').show();
                sym.getSymbol('Video_Player').$('Video')[0].controls = false;
              }

              // only display interactive unites for specific videos
              if(sym.presenter.vType === 'question' || sym.presenter.vType === 'loop' || sym.presenter.vType === 'wrong'){
                sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_B.png');
                sym.$('background').css('background-image','url(images/BridgeIMG_B.png)');

                // load video loop
                if((sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.fileNameBld('start')
                    && sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.fileNameBld('front')
                    && sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.fileNameBld('back'))
                    && (sym.presenter.vType === 'question' || sym.presenter.vType === 'wrong')){
                  sym.presenter.showInteract();
                  sym.presenter.nextVideo = sym.presenter.playNext('loop');
                }
              // correct response presentation
              } else if (sym.presenter.vType === 'correct') {
                sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_B.png');
                sym.$('background').css('background-image','url(images/BridgeIMG_B.png)');
                // still within maximum question scope
                if(sym.presenter.curQuest <= sym.presenter.questions){

                  sym.presenter.nextVideo = sym.presenter.playNext('question');
                // finish video playback
                } else {
                  sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_C.png');
                  sym.$('background').css('background-image','url(images/BridgeIMG_C.png)');
                  sym.presenter.nextVideo = sym.presenter.playNext('back');
                  sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_A.png');
                  sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');
                  sym.$('PlaybackHover').hide();
                  sym.$('Playback_Bar2').hide();
                  sym.getSymbol('Video_Player').$('Video')[0].controls = true;
                  sym.presenter.nextVideo = sym.presenter.playNext('back');
                  if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
                    sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo);
                  }
                }
              }
            }
            // init selected video
            if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
              sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo);
            }

            // start selected video
            sym.presenter.videoPlay();

            // build menu
            sym.presenter.genNav();

          }

        });
      },
      // handles video playback
      videoPlay: function(){
      	// start video
      	sym.getSymbol('Video_Player').$('Video')[0].play();
        // init continued video playback
        sym.presenter.videoCont();

      },
      // reset question set
      reset: function(){
        var video = '';

        video = sym.presenter.setVideo();

        if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== video){
          sym.getSymbol('Video_Player').$('Video').attr('src',video);
        }
        sym.presenter.startPlayback();

        sym.$('reset').hide();
      },
      setVideo: function(override, play){
        if(typeof play === 'undefined'){
          play = false;
        }
        var video = '';
        if(typeof override !== 'undefined'){
          sym.presenter.status = override;
        }
        sym.presenter.time = 0;

        // determine video to be played
        switch(sym.presenter.status){
          case 'INTRO':
            video = sym.presenter.mediaDir + 'OPENING' + sym.presenter.vidExt;
            sym.presenter.status = 'OPENING';
          break;
          case 'OPENING':
            video = sym.presenter.mediaDir + 'question_prompt' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_0';
          break;
          case 'LOOP_0':
          case 'RESET_1':
          case 'RESET_2':
          case 'RESET_3':
            video = sym.presenter.mediaDir + 'LOOP_0' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_0';
            sym.presenter.showInteract();
          break;
          case 'LOOP_1':
            video = sym.presenter.mediaDir + 'RESET_1' + sym.presenter.vidExt;
            sym.presenter.status = 'RESET_1';
          break;
          case 'LOOP_2':
            video = sym.presenter.mediaDir + 'RESET_2' + sym.presenter.vidExt;
            sym.presenter.status = 'RESET_1';
          break;
          case 'LOOP_3':
            video = sym.presenter.mediaDir + 'RESET_1' + sym.presenter.vidExt;
            sym.presenter.status = 'RESET_2';
          break;
          case 'ANSWER_1':
            video = sym.presenter.mediaDir + 'LOOP_1' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_1';
            sym.presenter.hideInteract();
            sym.$('reset').show();
          break;
          case 'ANSWER_2':
            video = sym.presenter.mediaDir + 'LOOP_2' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_2';
            sym.presenter.hideInteract();
            sym.$('reset').show();
          break;
          case 'ANSWER_3':
            video = sym.presenter.mediaDir + 'LOOP_3' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_3';
            sym.presenter.hideInteract();
            sym.$('reset').show();
          break;
          case 'REPLAY_1':
            video = sym.presenter.mediaDir + 'REPLAY_1' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_1';
            sym.presenter.hideInteract();
            sym.$('reset').show();
          break;
          case 'REPLAY_2':
            video = sym.presenter.mediaDir + 'REPLAY_2' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_2';
            sym.presenter.hideInteract();
            sym.$('reset').show();
          break;
          case 'REPLAY_3':
            video = sym.presenter.mediaDir + 'REPLAY_3' + sym.presenter.vidExt;
            sym.presenter.status = 'LOOP_3';
            sym.presenter.hideInteract();
            sym.$('reset').show();
          break;
        };

        if(play === true){
          if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== video){
            sym.getSymbol('Video_Player').$('Video').attr('src',video);
          }
          sym.presenter.startPlayback();
        } else {
          return video;
        }
      },
      // custom playback mode used for repetative looping videos
      loopedPlayback: function(){

        sym.$(sym.getSymbol('Video_Player').$('Video')[0]).bind('ended', function ()
        {
          var video = '';

          video = sym.presenter.setVideo();

          if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== video){
            sym.getSymbol('Video_Player').$('Video').attr('src',video);
          }
          sym.presenter.startPlayback();

        });

      },
      // pre-load initial videos
      loadInitVideo: function(){

        // init hide buttons
        sym.presenter.hideInteract();
        sym.getSymbol('Playback_Bar2').$('play_btn').hide();
        sym.getSymbol('Playback_Bar2').$('back_btn').hide();
        sym.$('PlaybackHover').hide();
        sym.$('Playback_Bar2').hide();
        sym.getSymbol('Video_Player').$('Video')[0].controls = true;

        // custom playback engines
        if(sym.presenter.type === 'triple-vertical'){

          sym.getSymbol('Playback_Bar2').$('forward_btn').hide();
          sym.presenter.status = 'OPENING';
          sym.presenter.loopedPlayback();

        // load default playback engine
        } else {

          sym.presenter.nextVideo = sym.presenter.fileNameBld('intro');
          sym.presenter.videoCont();

        }

        // build menu
        sym.presenter.genNav();

      },
      // jump to assigned video position
      jumpTo: function(time, vidId){

        if(typeof time !== 'undefined'){
          sym.presenter.time = Number(time);
        } else {
          sym.presenter.time = 0;
        }

        sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_A.png');
        sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');

        if(typeof vidId !== 'undefined'){
          if(vidId > sym.presenter.questions){
            sym.presenter.nextPlayback(vidId);
          } else {
            sym.presenter.prevPlayback(vidId);
          }
        }
        sym.getSymbol('Video_Player').$('Video')[0].pause();
        if(typeof time !== 'undefined'){
          sym.getSymbol('Video_Player').$('Video')[0].currentTime = Number(time);
        }
        sym.getSymbol('Video_Player').$('Video')[0].play();
      },
      // generate popout menu items
      genNav: function(){
        var navHTML = '',
            i = 1,
            limit = 0,
            curNum = 0,
            keyActions = [],
            defInitKey = 49;

        if(sym.presenter.type === 'triple-vertical'){

          navHTML += '<div id="Stage_Options_Symbol_Start" class="Stage_Options_Symbol_Start" style="cursor:pointer;margin-bottom:25px;margin-top:25px" onclick="com.stage.presenter.setVideo(\'INTRO\',true)">Intro</div>';
          navHTML += '<div id="Stage_Options_Symbol_Start" class="Stage_Options_Symbol_Start" style="cursor:pointer;margin-bottom:25px;margin-top:25px" onclick="com.stage.presenter.setVideo(\'REPLAY_1\',true)">Answer 1</div>';
          navHTML += '<div id="Stage_Options_Symbol_Start" class="Stage_Options_Symbol_Start" style="cursor:pointer;margin-bottom:25px;margin-top:25px" onclick="com.stage.presenter.setVideo(\'REPLAY_2\',true)">Answer 2</div>';
          navHTML += '<div id="Stage_Options_Symbol_Start" class="Stage_Options_Symbol_Start" style="cursor:pointer;margin-bottom:25px;margin-top:25px" onclick="com.stage.presenter.setVideo(\'REPLAY_3\',true)">Answer 3</div>';

          // init key actions
          keyActions[defInitKey] = 'com.stage.presenter.setVideo(\'INTRO\',true)';
          keyActions[(defInitKey++)] = 'com.stage.presenter.setVideo(\'REPLAY_1\',true)';
          keyActions[(defInitKey++)] = 'com.stage.presenter.setVideo(\'REPLAY_2\',true)';
          keyActions[(defInitKey++)] = 'com.stage.presenter.setVideo(\'REPLAY_3\',true)';

        } else {

          navHTML += '<div id="Stage_Options_Symbol_Start" class="Stage_Options_Symbol_Start" style="cursor:pointer;margin-bottom:20px;margin-top:20px" onclick="com.stage.presenter.jumpTo(0,0)">START</div>';

          keyActions[(defInitKey++)] = 'com.stage.presenter.prevPlayback(0)';

          if(sym.presenter.curQuest === -1 || (sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] === sym.presenter.fileNameBld('front')) || (sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] === sym.presenter.fileNameBld('back'))){
            limit = sym.presenter.openPosOpts.length;

            for(i = 0; i < limit; i++){
              curNum++;
              navHTML += '<div id="Stage_Options_Symbol_' + i + '" class="Stage_Options_Symbol_' + i + '" style="cursor:pointer;margin-bottom:10px;margin-top:10px;font-size:18px" onclick="com.stage.presenter.jumpTo(' + sym.presenter.openPosOpts[i][1] + ',0)">&bull; ' + sym.presenter.openPosOpts[i][0] + '</div>';

              keyActions[(defInitKey++)] = 'com.stage.presenter.jumpTo(' + sym.presenter.openPosOpts[i][1] + ',0)';
            }

            navHTML += '<div id="Stage_Options_Symbol_Opening" class="Stage_Options_Symbol_Opening" style="cursor:pointer;margin-bottom:10px;margin-top:10px;font-size:18px" onclick="com.stage.presenter.prevPlayback(1)">&bull; Small Group Tasks Quiz</div>';

            keyActions[(defInitKey++)] = 'com.stage.presenter.prevPlayback(1)';

            limit = sym.presenter.backPosOpts.length;

            for(i = 0; i < limit; i++){
              curNum++;
              navHTML += '<div id="Stage_Options_Symbol_' + i + '" class="Stage_Options_Symbol_' + i + '" style="cursor:pointer;margin-bottom:10px;margin-top:10px;font-size:18px" onclick="com.stage.presenter.jumpTo(' + sym.presenter.backPosOpts[i][1] + ',' + (sym.presenter.questions + 1) + ')">&bull; ' + sym.presenter.backPosOpts[i][0] + '</div>';

              keyActions[(defInitKey++)] = 'com.stage.presenter.jumpTo(' + sym.presenter.backPosOpts[i][1] + ',' + (sym.presenter.questions + 1) + ')';

            }

          } else {

            navHTML += '<div id="Stage_Options_Symbol_Opening" class="Stage_Options_Symbol_Opening" style="cursor:pointer;margin-bottom:20px;margin-top:20px" onclick="com.stage.presenter.prevPlayback(1)">Opening</div>';

            keyActions[(defInitKey++)] = 'com.stage.presenter.prevPlayback(1)';

            for(i = 1; i <= sym.presenter.questions; i++){
              navHTML += '<div id="Stage_Options_Symbol_Question_' + i + '" class="Stage_Options_Symbol_Question_' + i + '" style="cursor:pointer;margin-bottom:20px" onclick="com.stage.presenter.prevPlayback(' + (i+1) + ')" href="">Action ' + i + '</div>';

              keyActions[(defInitKey++)] = 'com.stage.presenter.prevPlayback(' + (i+1) + ')';
            }

            navHTML += '<div id="Stage_Options_Symbol_Back" class="Stage_Options_Symbol_Back" style="cursor:pointer" onclick="com.stage.presenter.nextPlayback(' + (sym.presenter.questions + 1) + ', 0)">End</div>';

            keyActions[(defInitKey++)] = 'com.stage.presenter.nextPlayback(' + (sym.presenter.questions + 1) + ')';

          }

        }

        // disable key triggers
        document.removeEventListener('keydown', sym.presenter.keyFunc);

        // store keyactions within presenter object
        sym.presenter.keyActions = keyActions;

        // init keydown triggers
        sym.presenter.keyFunc = function(event) {
          var keyLen = sym.presenter.keyActions.length,
              i = 0;

          // walk through assigned keydown keys and actions
          for(i = 0; i < keyLen; i++){
            // check for assigned action then assign as needed
            if(sym.presenter.keyActions[i]){
              if(i === event.keyCode){
                eval(sym.presenter.keyActions[i]);
              }
            }
          }

        };

        // enable new key triggers
        document.addEventListener('keydown', sym.presenter.keyFunc);

        sym.getSymbol('Options_Symbol').$('NavText').html(navHTML);

      },
      // initialize default quick keys
      initKeyActions: function(){

        var keyFunc = function(event) {
          switch(event.keyCode){
            // space key - pause playback
            case 32:
              if(sym.presenter.paused === 1){
                sym.presenter.paused = 0;
                sym.getSymbol('Video_Player').$('Video')[0].play();
              } else {
                sym.presenter.paused = 1;
                sym.getSymbol('Video_Player').$('Video')[0].pause();
              }
            break;
            //Mm - toggle menu
            case 77:
            case 109:
              sym.presenter.toggleOptions();
            break;
          }
        };

        document.addEventListener('keydown', keyFunc);

        //document.removeEventListener('keydown', keyFunc);

      },
      // start quiz
      playQuiz: function(){

        sym.presenter.initKeyActions();

        // set custom background image
        sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');

        // build menu
        sym.presenter.genNav();

        // check for video paused status then present clickable play option
        if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)){
          sym.$('Answers').show();
          sym.$('Answers').bind('click', function(){
            sym.getSymbol('Video_Player').$('Video')[0].play();
            sym.$('Answers').hide();
            sym.$('Answers').unbind('click');
          });
        }

        // start playback
        sym.presenter.loadInitVideo();
      },
      // media playback controls
      pausePlayback: function(){
        sym.getSymbol('Playback_Bar2').$('pause_btn').hide();
        sym.getSymbol('Playback_Bar2').$('play_btn').show();
        sym.getSymbol('Video_Player').$('Video')[0].pause();
      },
      startPlayback: function(){
        sym.getSymbol('Playback_Bar2').$('pause_btn').show();
        sym.getSymbol('Playback_Bar2').$('play_btn').hide();
        sym.getSymbol('Video_Player').$('Video')[0].play();
      },
      nextPlayback: function(overRide, time){
        sym.$('background').hide();
        if(typeof overRide !== 'undefined'){
          sym.presenter.curQuest = overRide;
        }
        if(typeof time !== 'undefined'){
          sym.presenter.time = Number(time);
        }
        sym.getSymbol('Playback_Bar2').$('back_btn').show();
        sym.presenter.curQuest +=  1;
        if(sym.presenter.curQuest <= sym.presenter.questions){
          sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_B.png');
          sym.$('background').css('background-image','url(images/BridgeIMG_B.png)');
          sym.$('Playback_Bar2').show();
          sym.$('PlaybackHover').show();
          sym.getSymbol('Video_Player').$('Video')[0].controls = false;
          sym.presenter.nextVideo = sym.presenter.playNext('question');
          if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
            sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo);
          }
          sym.presenter.videoPlay();
        } else {
          sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_C.png');
          sym.$('background').css('background-image','url(images/BridgeIMG_C.png)');
          sym.$('Playback_Bar2').hide();
          sym.$('PlaybackHover').hide();
          sym.getSymbol('Video_Player').$('Video')[0].controls = true;
          sym.presenter.nextVideo = sym.presenter.playNext('back');
          if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
            sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo + (sym.presenter.time > 0 ? '#t='+sym.presenter.time : ''));
          }
          sym.$('background').show();
          sym.presenter.videoPlay();
          sym.getSymbol('Playback_Bar2').$('forward_btn').hide();
        }
        // build menu
        sym.presenter.genNav();
      },
      prevPlayback: function(overRide){
        sym.$('background').hide();
        if(typeof overRide !== 'undefined'){
          sym.presenter.curQuest = overRide;
        }
        sym.$('forward_btn').show();
        if(sym.presenter.curQuest >= -1){
          sym.presenter.curQuest -=  1;
          // load intro video, hide button
          switch(sym.presenter.curQuest){
            case -1:
            sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_A.png');
              sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');
              sym.$('Playback_Bar2').hide();
              sym.$('PlaybackHover').hide();
              sym.getSymbol('Video_Player').$('Video')[0].controls = true;
              sym.presenter.nextVideo = sym.presenter.playNext('front');
              if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
                sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo + (sym.presenter.time > 0 ? '#t='+sym.presenter.time : ''));
              }
              sym.getSymbol('Playback_Bar2').$('back_btn').hide();
              sym.presenter.videoPlay();
            break;
            case 0:
            sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_A.png');
              sym.$('background').css('background-image','url(images/BridgeIMG_A.png)');
              sym.$('PlaybackHover').show();
              sym.$('Playback_Bar2').show();
              sym.getSymbol('Video_Player').$('Video')[0].controls = false;
              sym.presenter.nextVideo = sym.presenter.playNext('start');
              if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
                sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo);
              }
              sym.getSymbol('Playback_Bar2').$('back_btn').hide();
              sym.presenter.videoPlay();
            break;
            default:
              sym.getSymbol('Video_Player').$('Video').attr('poster','images/BridgeIMG_B.png');
              sym.$('background').css('background-image','url(images/BridgeIMG_B.png)');
              sym.$('PlaybackHover').show();
              sym.$('Playback_Bar2').show();
              sym.getSymbol('Video_Player').$('Video')[0].controls = false;
              sym.presenter.nextVideo = sym.presenter.playNext('question');
              if(sym.getSymbol('Video_Player').$('Video').attr('src').split('#')[0] !== sym.presenter.nextVideo){
                sym.getSymbol('Video_Player').$('Video').attr('src',sym.presenter.nextVideo);
              }
              sym.$('background').show();
              sym.presenter.videoPlay();
            break;
          }
        }
        // build menu
        sym.presenter.genNav();
      },
      toggleOptions: function(){
        if(sym.presenter.optionOpen === false){
          sym.getSymbol('Options_Symbol').play();
          sym.$('Answers').hide();
          sym.presenter.optionOpen = true;
        } else {
          sym.getSymbol('Options_Symbol').playReverse();
          sym.$('Answers').show();
          sym.presenter.optionOpen = false;
        }
      },
      toggleOptionsPlayback: function(){
        if(sym.presenter.optionPlaybackOpen === false){
          sym.getSymbol('Playback_Bar2').play();
          sym.presenter.optionPlaybackOpen = true;
        } else {
          sym.getSymbol('Playback_Bar2').playReverse();
          sym.presenter.optionPlaybackOpen = false;
        }
      }
    }

    // start playback
    sym.presenter.playQuiz();
    };

  });
});

// make composition publicly available
var com = AdobeEdge.getComposition('EDGE-876545682');
