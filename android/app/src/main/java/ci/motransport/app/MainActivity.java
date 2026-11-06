package ci.motransport.app;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Capacitor applique d'abord le thème sans barre d'action et crée la vue…
        super.onCreate(savedInstanceState);
        // …puis on passe en affichage bord à bord : l'app gère elle-même les zones sûres
        // (barre d'état, barre de gestes). L'appeler avant super.onCreate figerait la fenêtre
        // avec le thème de lancement et ferait apparaître une barre d'action native.
        EdgeToEdge.enable(this);
    }
}
