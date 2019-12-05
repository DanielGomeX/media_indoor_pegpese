import React, { Component } from 'react';
import ModalConfig from '../Config-Modal';
import ModalBackground from '../Background-Modal';
import ModalMedia from '../Media-Modal';

import './styles.css';

class Menu extends Component {

  // Modal de configuração
    configModalHandler = ({ handleShowConfig }) => {
      this.showModalConfig = handleShowConfig;
    }
   
    onConfigClick = () => {
     this.showModalConfig();
    }

  // Modal de Cadastro - Background
    backgroundModalHandler = ({ handleShowBackground }) => {
      this.showModalBackground = handleShowBackground;
    }
   
    onBackgroundClick = () => {
     this.showModalBackground();
    }

  // Modal de Cadastro - Media
    mediaModalHandler = ({ handleShowMedia }) => {
      this.showModalMedia = handleShowMedia;
    }
   
    onMediaClick = () => {
     this.showModalMedia();
    }
   
   
    render(){
       return (           
            <nav id="wrap_menu">
            <ul>
                <li name="register" className="dropdown">
                    <span>Cadastro</span>
                    <div className="dropdown-content">
                        <a href="#" name="depto" id="deptoRegister" onClick={this.onBackgroundClick}>Plano de Fundo</a>
                        <a href="#" name="media" id="mediaRegister" onClick={this.onMediaClick}>MÍDIA</a>
                    </div>
                </li>
                <li name="config" id="config" onClick={this.onConfigClick}><a href="#">Configurar</a></li>
            </ul>
            <ModalConfig  ref={this.configModalHandler} />
            <ModalBackground  ref={this.backgroundModalHandler} />
            <ModalMedia  ref={this.mediaModalHandler} />
            </nav>  
       )
     }
   }

export default Menu;